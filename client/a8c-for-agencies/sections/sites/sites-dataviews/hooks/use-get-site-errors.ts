import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { SiteData, SiteError } from '../../types';

export default function useGetSiteErrors() {
	const translate = useTranslate();

	return useCallback(
		( site?: SiteData ): SiteError[] => {
			const errors: SiteError[] = [];
			if ( site?.error?.status === 'failed' ) {
				errors.push( { severity: 'high', message: translate( 'Connectivity issue' ) } );
			}

			if ( site?.scan?.status === 'failed' ) {
				errors.push( {
					severity: 'medium',
					message: translate( '%(count)s threat found', '%(count)s threats found', {
						count: site.scan.threats,
						args: {
							count: site.scan.threats,
						},
						comment: '%(count) here is the number of threats found',
					} ),
				} );
			}

			if ( site?.plugin?.status === 'warning' ) {
				errors.push( {
					severity: 'medium',
					message: translate(
						'%(count)s plugin requires update',
						'%(count)s plugins require updates',
						{
							count: site.plugin.updates,
							args: {
								count: site.plugin.updates,
							},
							comment: '%(count) here is the number of plugins that require updates',
						}
					),
				} );
			}

			return errors;
		},
		[ translate ]
	);
}
