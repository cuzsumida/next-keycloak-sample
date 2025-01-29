'use client'

export default function Page() {
  const handleClick = async () => {
    fetch('/api/auth/sso-logout')
    window.location.href = '/';
  }

  return (
    <button type="button" onClick={handleClick}>
      SignOut with SSO
    </button>
  )
}