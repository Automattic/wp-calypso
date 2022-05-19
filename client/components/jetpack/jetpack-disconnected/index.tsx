import { localizeUrl } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import JetpackDisconnectedSVG from 'calypso/assets/images/jetpack/disconnected-gray.svg';
import ExternalLink from 'calypso/components/external-link';
import Upsell from 'calypso/components/jetpack/upsell';
import { preventWidows } from 'calypso/lib/formatting';
import { JETPACK_SUPPORT_CONNECTION_ISSUES } from 'calypso/lib/url/support';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

const JetpackDisconnectedIcon = () => (
	<div className="jetpack-disconnected__icon-header">
		<img src={ JetpackDisconnectedSVG } alt="Jetpack disconnected status" />
	</div>
);

const JetpackDisconnected: FunctionComponent = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { name: siteName, slug: siteSlug, URL: siteUrl } = useSelector( getSelectedSite ) ?? {};
	const reconnectUrl = `https://wordpress.com/settings/disconnect-site/${ siteSlug }?type=down`;
	const body = [
		<span className="jetpack-disconnected__paragraph" key="paragraph-1">
			{ preventWidows(
				translate( 'Jetpack is unable to reach your site {{siteName/}} at this moment.', {
					components: { siteName: <strong>{ siteName }</strong> },
				} )
			) }
		</span>,
		<span className="jetpack-disconnected__paragraph" key="paragraph-2">
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
		</span>,
	];
	return (
		<Upsell
			headerText={ translate( 'Jetpack connection has failed' ) }
			bodyText={ body }
			buttonLink={ reconnectUrl }
			buttonText={ translate( 'Reconnect Jetpack' ) }
			onClick={ () => dispatch( recordTracksEvent( 'calypso_jetpack_backup_reconnect_click' ) ) }
			iconComponent={ <JetpackDisconnectedIcon /> }
			secondaryButtonLink={ localizeUrl( JETPACK_SUPPORT_CONNECTION_ISSUES ) }
			secondaryButtonText={ translate( 'I need help' ) }
			secondaryOnClick={ () =>
				dispatch( recordTracksEvent( 'calypso_jetpack_backup_support_click' ) )
			}
		/>
	);
};

export default JetpackDisconnected;
