import { WPCOM_FEATURES_INSTALL_PLUGINS, PLAN_WPCOM_PRO } from '@automattic/calypso-products';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import SettingsSectionHeader from 'calypso/my-sites/site-settings/settings-section-header';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import isPrivateSite from 'calypso/state/selectors/is-private-site';
import isSiteComingSoon from 'calypso/state/selectors/is-site-coming-soon';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './wpcom.scss';

class AmpWpcom extends Component {
	render() {
		const { canInstallPlugins, siteSlug, translate, siteIsComingSoon, siteIsPrivate } = this.props;

		let tracksProps;

		if ( ! canInstallPlugins ) {
			tracksProps = {
				tracksImpressionName: 'calypso_settings_amp_upsell_impression',
				tracksClickName: 'calypso_settings_amp_upsell_click',
				event: 'calypso_settings_amp_upsell',
			};
		}

		if ( siteIsComingSoon || siteIsPrivate ) {
			return null;
		}

		return (
			<div className="amp__main site-settings__traffic-settings">
				<SettingsSectionHeader title={ translate( 'Accelerated Mobile Pages (AMP)' ) } />
				<UpsellNudge
					title={ translate( 'Install the AMP plugin' ) }
					description={ translate(
						'AMP enables the creation of websites and ads that load near instantly, ' +
							'giving site visitors a smooth, more engaging experience on mobile and desktop.'
					) }
					plan={ PLAN_WPCOM_PRO }
					href={ `/plugins/amp/${ siteSlug }` }
					forceHref={ true }
					showIcon={ true }
					forceDisplay
					{ ...tracksProps }
				/>
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const canInstallPlugins = siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PLUGINS );
		const siteIsComingSoon = isSiteComingSoon( state, siteId );
		const siteIsPrivate = isPrivateSite( state, siteId );

		return {
			siteSlug: getSelectedSiteSlug( state ),
			canInstallPlugins,
			siteIsComingSoon,
			siteIsPrivate,
		};
	},
	{ recordTracksEvent }
)( localize( AmpWpcom ) );
