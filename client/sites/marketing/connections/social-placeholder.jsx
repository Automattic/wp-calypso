import { ExternalLink } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { PanelCard, PanelCardHeading } from 'calypso/components/panel';
import { useSelector } from 'calypso/state';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';

import './social-placeholder.scss';

export default function SocialPlaceholder( { siteId } ) {
	const translate = useTranslate();
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	if ( ! siteAdminUrl ) {
		return null;
	}

	return (
		<PanelCard className="social-placeholder">
			<PanelCardHeading>{ translate( 'Share posts with Jetpack Social' ) }</PanelCardHeading>
			<p>
				{ translate(
					'Connect your site to social media networks and automatically share new posts. {{link}}Manage Jetpack Social{{/link}}',
					{
						components: {
							link: <ExternalLink href={ siteAdminUrl + 'admin.php?page=jetpack-social' } />,
						},
					}
				) }
			</p>
		</PanelCard>
	);
}
