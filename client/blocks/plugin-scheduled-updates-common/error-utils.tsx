import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import type { APIError } from '@automattic/data-stores';

export const handleErrorMessage = ( error: APIError ): string => {
	switch ( error.status ) {
		case 500:
			return translate(
				'Your website is experiencing technical issues. Please refer to our {{a}}support documentation{{/a}} for assistance in resolving this error.',
				{
					components: {
						a: (
							<a
								href={ localizeUrl(
									'https://wordpress.com/support/resolve-jetpack-errors/#critical-error-on-the-site'
								) }
								target="_blank"
								rel="noreferrer"
							/>
						 ) as JSX.Element,
					},
				}
			) as string;
		default:
			// Return the default error message for other error codes
			return error.message;
	}
};
