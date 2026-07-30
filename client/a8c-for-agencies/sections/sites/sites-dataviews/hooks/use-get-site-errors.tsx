import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { urlToSlug } from 'calypso/lib/url/http-utils';
import { JETPACK_SCAN_ID } from '../../features/features';
import { SiteData, SiteError } from '../../types';

export default function useGetSiteErrors() {
	const translate = useTranslate();

	return useCallback(
		( data?: SiteData ): SiteError[] => {
			const errors: SiteError[] = [];
			if ( data?.error?.status === 'failed' ) {
				errors.push( { severity: 'high', message: translate( 'Connectivity issue' ) } );
			}

			if ( data?.scan?.status === 'failed' ) {
				const scanLink = `/sites/overview/${ urlToSlug(
					data.site?.value?.url
				) }/${ JETPACK_SCAN_ID }`;

				errors.push( {
					severity: 'medium',
					message: (
						<a href={ scanLink } onClick={ ( event ) => event.stopPropagation() }>
							{ translate( '%(count)s threat found', '%(count)s threats found', {
								count: data.scan.threats,
								args: {
									count: data.scan.threats,
								},
								comment: '%(count) here is the number of threats found',
							} ) }
						</a>
					),
				} );
			}

			if ( data?.site?.value?.is_simple ) {
				const siteSlug = data?.site?.value?.url?.replace( /(^\w+:|^)\/\//, '' );
				const wpOverviewUrl = `https://wordpress.com/overview/${ siteSlug }`;

				errors.push( {
					severity: 'medium',
					message: translate(
						'We are still provisioning your site. In the meantime, you can {{a}}set up your site{{/a}}.',
						{
							components: {
								a: (
									<ExternalLink
										href={ wpOverviewUrl }
										onClick={ ( e ) => e.stopPropagation() }
										children={ null }
									/>
								),
							},
						}
					),
				} );
			}

			return errors;
		},
		[ translate ]
	);
}
