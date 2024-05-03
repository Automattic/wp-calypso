import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import StatsCardUpsellOverlay from './stats-card-upsell-overlay';
import { Props } from './';

const StatsCardUpdateJetpackVersion: React.FC< Props > = ( { className, siteId, statType } ) => {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const tracksEvent = 'update_jetpack_feature_card_clicked';

	if ( isWPCOMSite ) {
		// Don't show Jetpack update outside Jetpack.
		return null;
	}

	const onClick = () => {
		// publish an event
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_${ tracksEvent }`, {
			module: statType,
		} );

		// redirect to the Plugins page
		setTimeout( () => page( `/wp-admin/plugins.php` ), 250 );
	};

	return (
		<StatsCardUpsellOverlay
			className={ className }
			onClick={ onClick }
			copyText={ translate(
				'Update your Jetpack plugin to see this feature. {{learnMoreLink}}Learn more{{/learnMoreLink}}',
				{
					components: {
						learnMoreLink: <InlineSupportLink supportContext="stats" showIcon={ false } />,
					},
				}
			) }
			buttonComponent={
				<Button className="jetpack-emerald-button" onClick={ onClick } primary>
					{ translate( 'Update Jetpack plugin' ) }
				</Button>
			}
		/>
	);
};

export default StatsCardUpdateJetpackVersion;
