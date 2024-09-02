declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_SERVER: string;
    NEXT_PUBLIC_DELAY: string;
    NEXT_PUBLIC_LIMIT: string;
    NEXT_CLIENT_ID: string;
    DB_SERVER: string;
    DB_NAME: string;
  }
}