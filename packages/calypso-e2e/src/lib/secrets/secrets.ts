import fs from 'fs/promises';
import path from 'path';

let secrets: Secrets | null = null;

/**
 * Get the secrets needed for E2E testing.
 *
 * @throws If the secrets have not been initialized.
 * @returns The E2E secrets.
 */
export function getSecrets(): Secrets {
	if ( ! secrets ) {
		throw new Error(
			'Secrets have not been initialized.\n' +
				'Decrypt the secrets file and make sure "initializeSecrets" is called in the Jest setup.'
		);
	}

	return secrets;
}

/**
 * Initializes the secrets needed for E2E testing.
 */
export async function initializeSecrets(): Promise< void > {
	try {
		const secretsJson = await fs.readFile( path.join( __dirname, 'decrypted-secrets.json' ), {
			encoding: 'utf-8',
		} );
		secrets = JSON.parse( secretsJson );
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
