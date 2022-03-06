import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import JetpackDisconnected from 'calypso/assets/images/jetpack/disconnected.svg';
import ExternalLink from 'calypso/components/external-link';
import PromoCard from 'calypso/components/promo-section/promo-card';
import { preventWidows } from 'calypso/lib/formatting';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { JETPACK_SUPPORT_CONNECTION_ISSUES } from 'calypso/lib/url/support';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

const JetpackDisconnectedWPCOM: FunctionComponent = () => {
	const translate = useTranslate();
	const { name: siteName, slug: siteSlug, URL: siteUrl } = useSelector( getSelectedSite ) ?? {};
	const reconnectUrl = `/settings/disconnect-site/${ siteSlug }?type=down`;
	const onReconnectClick = useTrackCallback( undefined, 'calypso_jetpack_backup_reconnect_click' );
	const onSupportClick = useTrackCallback( undefined, 'calypso_jetpack_backup_support_click' );
	return (
		<PromoCard
			title={ preventWidows( translate( 'Jetpack connection has failed' ) ) }
			image={ { path: JetpackDisconnected } }
			isPrimary
		>
			<p>
				{ preventWidows(
					translate( 'Jetpack is unable to reach your site {{siteName/}} at this moment.', {
						components: { siteName: <strong>{ siteName }</strong> },
					} )
				) }
			</p>
			<p>
				{ preventWidows(
					translate(
						'Please visit {{siteUrl/}} to ensure your site is loading correctly and reconnect Jetpack if necessary.',
						{
							components: {
								siteUrl: <ExternalLink href={ siteUrl }>{ siteUrl }</ExternalLink>,
							},
						}
					)
				) }
			</p>
			<div className="jetpack-disconnected-wpcom__ctas">
				<Button
					className="jetpack-disconnected-wpcom__cta"
					href={ reconnectUrl }
					onClick={ onReconnectClick }
					primary
				>
					{ translate( 'Reconnect Jetpack' ) }
				</Button>
				<Button
					className="jetpack-disconnected-wpcom__cta"
					href={ JETPACK_SUPPORT_CONNECTION_ISSUES }
					onClick={ onSupportClick }
				>
					{ translate( 'I need help' ) }
				</Button>
			</div>
		</PromoCard>
	);
};

export default JetpackDisconnectedWPCOM;
