// amplify-config.js
export const awsconfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-2_mZUEMm9I0',
      userPoolClientId: 'fdrebnonvq1u8elpfridlh3hl',
      loginWith: {
        oauth: {
          domain: 'us-east-2mzuemm9i0.auth.us-east-2.amazoncognito.com',
          scopes: ['email', 'openid', 'profile'],
          redirectSignIn: ['https://main.d2hyysa8rccvus.amplifyapp.com/'],
          redirectSignOut: ['https://main.d2hyysa8rccvus.amplifyapp.com/'],
          responseType: 'code', // Required for PKCE
        },
      },
    },
  },
};


