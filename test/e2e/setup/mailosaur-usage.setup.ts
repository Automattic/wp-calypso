import { SecretsManager } from '@automattic/calypso-e2e';
import { test as setup } from '@playwright/test';

setup( 'check mailosaur daily email limit', async ( { request } ) => {
	const apiKey = SecretsManager.secrets.mailosaur.apiKey;

	try {
		const response = await request.get( 'https://mailosaur.com/api/usage/limits', {
			headers: {
				Authorization: `Basic ${ Buffer.from( `${ apiKey }:` ).toString( 'base64' ) }`,
			},
		} );

		if ( ! response.ok() ) {
			throw new Error( `Mailosaur API returned ${ response.status() }` );
		}

		const limits = await response.json();
		const { current, limit } = limits.email;

		console.log( `Mailosaur email usage: ${ current }/${ limit }` );

		if ( current >= limit ) {
			console.warn( 'Mailosaur daily email limit reached!' );
			process.env.MAILOSAUR_LIMIT_REACHED = 'true';
		} else {
			process.env.MAILOSAUR_LIMIT_REACHED = 'false';
		}
	} catch ( error ) {
		console.error( 'Failed to check Mailosaur usage limits:', error );
		// Fail open: don't block tests if we can't check the limit
		process.env.MAILOSAUR_LIMIT_REACHED = 'false';
	}
} );
