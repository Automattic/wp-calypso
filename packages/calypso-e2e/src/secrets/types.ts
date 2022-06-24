import { TEST_ACCOUNT_NAMES } from '.';

type OtherTestSiteName = 'notifications';
export type TestAccountName = typeof TEST_ACCOUNT_NAMES[ number ];

export interface Secrets {
	passwordForNewTestSignUps: string;
	storeSandboxCookieValue: string;
	testCouponCode: string;
	wpccAuthPath: string;
	calypsoOauthApplication: {
		client_id: string;
		client_secret: string;
	};
	martechTosUploadCredentials: {
		bearer_token: string;
	};
	mailosaur: {
		apiKey: string;
		inviteInboxId: string;
		signupInboxId: string;
		domainsInboxId: string;
		defaultUserInboxId: string;
	};
	testAccounts: {
		[ key in TestAccountName ]: {
			username: string;
			password: string;
			primarySite?: string;
			otherSites?: string[];
			totpKey?: string;
			userID?: number;
			email?: string;
		};
	};
	otherTestSites: {
		[ key in OtherTestSiteName ]: string;
	};
}
