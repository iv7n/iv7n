export interface CurrentUser {
  id?: string
  username?: string
}

export interface ITokenResult {
  expiredIn: number
  accessToken: string
}

export interface ITokenResultWithTS extends ITokenResult {
  ts: number
}

export class StorageToken<T extends CurrentUser = CurrentUser> {
  /**
   * the key of token in storage
   */
  tokenKey: string

  /**
   * the key of role in storage
   */
  roleKey: string

  constructor(tokenKey: string, roleKey: string) {
    this.tokenKey = tokenKey
    this.roleKey = roleKey
  }

  /**
   * check user isLogin
   * @param user - current user
   */
  checkIsLogin(user: T | undefined): boolean {
    return Boolean(user && user.username)
  }

  /**
   * use localStorage to store the authority info,
   * which might be sent from server in actual project.
   */
  getStorageRoles(): string[] {
    const authorityString = localStorage.getItem(this.roleKey)
    let authority
    try {
      if (authorityString) {
        authority = JSON.parse(authorityString)
      }
    } catch (e) {
      authority = authorityString
    }
    if (typeof authority === 'string') {
      return [authority]
    }

    return authority
  }

  /**
   * 存储角色 到 storage 中
   * @param roles - the roles of user
   */
  setStorageRoles(roles: string[]): void {
    return localStorage.setItem(this.roleKey, JSON.stringify(roles))
  }

  /**
   * 移除角色
   */
  removeStorageRoles(): void {
    localStorage.removeItem(this.roleKey)
  }

  /**
   * 存储 token 到 storage 中
   */
  setStorageToken(token: ITokenResult): void {
    localStorage.setItem(
      this.tokenKey,
      JSON.stringify({ ...token, ts: +new Date() })
    )
  }

  /**
   * 从 storage 中获取 token 过期或不存在则为 false
   */
  getStorageToken(): string | boolean {
    let tokenInfo: ITokenResultWithTS
    try {
      tokenInfo = JSON.parse(
        window.localStorage.getItem(this.tokenKey) as string
      )
      return this.checkTokenExpired(tokenInfo)
    } catch (error) {
      console.error('parse token error', error)
      return false
    }
  }

  /**
   * 移除 token
   */
  removeStorageToken(): void {
    localStorage.removeItem(this.tokenKey)
  }

  /**
   * 检测 token 是否失效 有效时返回token 反之为false
   * @param info - storage token info
   */
  private checkTokenExpired(
    info: (ITokenResult & { ts: number }) | undefined
  ): boolean | string {
    if (info) {
      const { expiredIn, ts, accessToken } = info
      if (expiredIn * 1000 + ts < +new Date()) {
        this.removeStorageToken()
        return true
      }
      return accessToken
    }
    return false
  }
}
