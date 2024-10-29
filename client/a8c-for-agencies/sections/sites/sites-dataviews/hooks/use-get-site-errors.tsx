import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
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
				errors.push( {
					severity: 'medium',
					message: translate( '%(count)s threat found', '%(count)s threats found', {
						count: data.scan.threats,
						args: {
							count: data.scan.threats,
						},
						comment: '%(count) here is the number of threats found',
					} ),
				} );
			}

			if ( data?.plugin?.status === 'warning' ) {
				errors.push( {
					severity: 'medium',
					message: translate(
						'%(count)s plugin requires update',
						'%(count)s plugins require updates',
						{
							count: data.plugin.updates,
							args: {
								count: data.plugin.updates,
							},
							comment: '%(count) here is the number of plugins that require updates',
						}
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
									<a
										href={ wpOverviewUrl }
										target="_blank"
										rel="noreferrer"
										onClick={ ( e ) => e.stopPropagation() }
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
