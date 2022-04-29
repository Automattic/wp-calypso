import fs from 'fs';
import path from 'path';

const SECRETS_FILE_NAME = 'decrypted-secrets.json';

/**
 * Initializes the secrets needed for E2E testing.
 */
function initializeSecrets(): Secrets {
	try {
		// Normally, any fs sync operations are a big no-no.
		// However, this only runs once on module load, and should be safe to do.
		// This is a more runtime deferred version of just having a '.json' module.
		// Once we're on ES2022, this would be a perfect use case for a top-level-await.
		const secretsJson = fs.readFileSync( path.join( __dirname, SECRETS_FILE_NAME ), {
			encoding: 'utf-8',
		} );
		return JSON.parse( secretsJson );
	} catch ( err ) {
		const error: Error = err as Error;
		throw new Error(
			'Failed to initialize the E2E secrets.\n' +
				'Have you decrypted the secrets file yet?\n' +
				'Export the decryption key to E2E_SECRETS_KEY and run "yarn decrypt-secrets".\n' +
				`Original error message: ${ error.message }`
		);
	}
}

export const secrets = initializeSecrets();

export type TestAccountName =
	| 'defaultUser'
	| 'eCommerceUser'
	| 'simpleSiteFreePlanUser'
	| 'simpleSitePersonalPlanUser'
	| 'gutenbergSimpleSiteUser'
	| 'gutenbergSimpleSiteEdgeUser'
	| 'gutenbergAtomicSiteUser'
	| 'gutenbergAtomicSiteEdgeUser'
	| 'coBlocksSimpleSiteEdgeUser'
	| 'siteEditorSimpleSiteUser'
	| 'siteEditorSimpleSiteEdgeUser'
	| 'martechTosUser'
	| 'calypsoPreReleaseUser'
	| 'i18nUser'
	| 'p2User'
	| 'jetpackUser'
	| 'jetpackUserPREMIUM'
	| 'jetpackUserJN'
	| 'commentingUser'
	| 'notificationsUser'
	| 'googleLoginUser';

export type OtherTestSiteName = 'notifications';

export interface Secrets {
	passwordForNewTestSignUps: string;
	storeSandboxCookieValue: string;
	testCouponCode: string;
	wpccAuthPath: string;
	restApiApplication: {
		user: string;
		client_id: string;
		redirect_uri: string;
		client_secret: string;
		access_code: string;
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
		};
	};
	otherTestSites: {
		[ key in OtherTestSiteName ]: string;
	};
}
