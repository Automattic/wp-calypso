import { localizeUrl } from '@automattic/i18n-utils';

export function isThrottledError( errorSlug: string ) {
	return 'throttled' === errorSlug;
}

export function getThrottledErrorMessage(
	translate: ( key: string, options?: Record< string, unknown > ) => string
): string {
	return translate(
		'Too many attempts. Please try again later. If you think this is in error, {{a}}contact support{{/a}}.',
		{
			components: {
				a: (
					<a
						href={ localizeUrl( 'https://wordpress.com/support/contact/' ) }
						target="_blank"
						rel="noopener noreferrer"
					></a>
				),
			},
		}
	);
}
