import { createElement } from '@wordpress/element';
import type { TranslateResult } from 'i18n-calypso';

type TranslateFn = (
	text: string,
	options?: {
		args?: Record< string, unknown >;
		components?: Record< string, JSX.Element >;
	}
) => TranslateResult;

interface EmailLinkHeaderOptions {
	headingOverride?: TranslateResult | string | null;
	subHeadingOverride?: TranslateResult | string | null;
	siteName?: string | null;
}

interface CheckEmailHeaderOptions {
	emailAddress?: string | null;
	headingOverride?: TranslateResult | string | null;
	subHeadingOverride?: TranslateResult | string | null;
}

const normalizeOverride = (
	value?: TranslateResult | string | null
): TranslateResult | string | undefined => {
	if ( value === null || value === undefined ) {
		return undefined;
	}
	return value;
};

export const getEmailLinkHeaders = (
	translate: TranslateFn,
	{ headingOverride, subHeadingOverride, siteName }: EmailLinkHeaderOptions = {}
) => {
	const heading = normalizeOverride( headingOverride ) ?? translate( 'Email me a login link' );

	let subHeading = normalizeOverride( subHeadingOverride );
	if ( ! subHeading ) {
		if ( siteName ) {
			subHeading = translate(
				'We’ll send you an email with a link that will log you in right away to %(siteName)s.',
				{
					args: {
						siteName,
					},
				}
			);
		} else {
			subHeading = translate(
				'We’ll send you an email with a link that will log you in right away.'
			);
		}
	}

	return { heading, subHeading };
};

export const getCheckYourEmailHeaders = (
	translate: TranslateFn,
	{ emailAddress, headingOverride, subHeadingOverride }: CheckEmailHeaderOptions = {}
) => {
	const heading = normalizeOverride( headingOverride ) ?? translate( 'Check your email' );

	let subHeading = normalizeOverride( subHeadingOverride );
	if ( ! subHeading ) {
		if ( emailAddress ) {
			subHeading = translate( "We've sent a login link to {{strong}}%(emailAddress)s{{/strong}}.", {
				args: {
					emailAddress,
				},
				components: {
					strong: createElement( 'strong', null ),
				},
			} );
		} else {
			subHeading = translate( 'We just emailed you a link.' );
		}
	}

	return { heading, subHeading };
};

export const getEmailCodeHeaders = ( translate: TranslateFn ) => ( {
	heading: translate( 'Email me a login code' ),
	subHeading: translate( "We'll send you an email with a code that will log you in right away." ),
} );
