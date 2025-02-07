import { Adapter } from "@auth/core/adapters";
import Redis from "ioredis";

export function RedisAdapter(client: Redis): Adapter {
  return {
    async createUser(user) {
      const id = crypto.randomUUID(); // または、他のID生成方法
      const key = `user:${id}`;
      await client.hmset(key, { id, ...user });
      return { id, ...user };
    },

    async getUser(id) {
      const key = `user:${id}`;
      const user = await client.hgetall(key);
      if (!Object.keys(user).length) return null;
      return {
        ...user,
        id: user.id,
        emailVerified: user.emailVerified ? new Date(user.emailVerified) : null, //Date型に
      } as AdapterUser
    },

    async getUserByEmail(email) {
      // 全てのuser:*キーをスキャンしてemailが一致するものを探す
      // (効率は良くない。emailをキーにした別のデータ構造を作るべき)
      let cursor = '0';
      do {
        const [nextCursor, keys] = await client.scan(cursor, 'MATCH', 'user:*', 'COUNT', 100);
        cursor = nextCursor;

        for (const key of keys) {
          const user = await client.hgetall(key);
          if (user.email === email) {
            return {
              ...user,
              id: user.id,
              emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            } as AdapterUser;
          }
        }
      } while (cursor !== '0');

      return null;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const accountKey = `account:${provider}:${providerAccountId}`;
      const account = await client.hgetall(accountKey);
      if (!Object.keys(account).length) return null;

      return await this.getUser(account.userId);
    },

    async updateUser(user) {
        const key = `user:${user.id}`;
        if(user.emailVerified instanceof Date) {
          await client.hmset(key, { ...user, emailVerified: user.emailVerified.toISOString() });
        } else {
          await client.hmset(key, user);
        }

      const updatedUser = await client.hgetall(key);

      return {
          ...updatedUser,
          id: updatedUser.id,
          emailVerified: updatedUser.emailVerified ? new Date(updatedUser.emailVerified) : null,
      } as AdapterUser;
    },

    async deleteUser(userId) {
      const key = `user:${userId}`;
      await client.del(key);

      // 関連するアカウントやセッションも削除する
      // (効率は良くない。userIdをキーにした別のデータ構造を作るべき)
      let cursor = "0";
        do {
            const [nextCursor, keys] = await client.scan(
            cursor,
            "MATCH",
            "account:*",
            "COUNT",
            100
            );
            cursor = nextCursor;

            for (const key of keys) {
                const account = await client.hgetall(key);
                if (account.userId === userId) {
                    await client.del(key);
                }
            }
        } while (cursor !== "0");
      
      cursor = "0"
        do {
          const [nextCursor, keys] = await client.scan(
            cursor,
            "MATCH",
            "session:*",
            "COUNT",
            100
          );
          cursor = nextCursor;
          for (const key of keys) {
            const session = await client.hgetall(key);

            if (session.userId === userId) {
              await client.del(key);
            }
          }
        } while (cursor !== "0");
    },

    async linkAccount(account) {
      const key = `account:${account.provider}:${account.providerAccountId}`;
      await client.hmset(key, account);
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const key = `account:${provider}:${providerAccountId}`;
      await client.del(key);
    },

    async createSession(session) {
      const key = `session:${session.sessionToken}`;
      await client.hmset(key, {
        ...session,
        expires: session.expires.toISOString(),
      });
      return {
        ...session,
        expires: new Date(session.expires),
      };
    },

    async getSessionAndUser(sessionToken) {
      const key = `session:${sessionToken}`;
      const session = await client.hgetall(key);
      if (!Object.keys(session).length) return null;

      const user = await this.getUser(session.userId);
      if (!user) return null;

      return {
        session: {
          ...session,
          expires: new Date(session.expires),
          userId: session.userId,
          sessionToken: sessionToken
        } ,
        user,
      };
    },

    async updateSession(session) {
      const key = `session:${session.sessionToken}`;
      if(session.expires instanceof Date) {
        await client.hmset(key, {...session, expires: session.expires.toISOString()});
      } else {
        await client.hmset(key, session)
      }
      const newSession = await client.hgetall(key)

      return {
          ...newSession,
          expires: new Date(newSession.expires),
          userId: newSession.userId,
          sessionToken: session.sessionToken
      }
    },

    async deleteSession(sessionToken) {
      const key = `session:${sessionToken}`;
      await client.del(key);
    },

    async createVerificationToken(verificationToken) {
      const key = `verification-token:${verificationToken.identifier}`;
      await client.hmset(key, {
        ...verificationToken,
        expires: verificationToken.expires.toISOString(),
      });
      return {
        ...verificationToken,
        expires: new Date(verificationToken.expires)
      }
    },

    async useVerificationToken({ identifier, token }) {
      const key = `verification-token:${identifier}`;
      const storedToken = await client.hgetall(key);
      if (!Object.keys(storedToken).length) return null;

      await client.del(key);

      if (storedToken.token !== token) return null;

      return {
        ...storedToken,
        expires: new Date(storedToken.expires)
      }
    },
  };
}