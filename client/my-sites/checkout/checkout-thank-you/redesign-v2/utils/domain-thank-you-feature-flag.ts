import config from '@automattic/calypso-config';

/**
 * Check if the new domain thank you page should be shown.
 * Feature flag: domains/new-thank-you-page
 */
export function shouldShowNewDomainThankYou(): boolean {
	return config.isEnabled( 'domains/new-thank-you-page' );
}
