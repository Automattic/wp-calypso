/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';
import analytics from 'lib/analytics';
import utils from 'lib/site/utils';

const config = require( 'config' );
const user = userFactory();

const JetpackPlanDetails = ( { selectedSite } ) => {
	const props = {
		icon: 'cog',
		title: i18n.translate( 'Set up your VaultPress and Akismet accounts' ),
		description: i18n.translate(
			'We emailed you at %(email)s with information for setting up Akismet and VaultPress on your site. ' +
			'Follow the instructions in the email to get started.',
			{ args: { email: user.get().email } }
		),
	};

	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		const trackManualInstall = ( eventName ) => {
			return () => {
				analytics.tracks.recordEvent( eventName );
			};
		};

		const reasons = utils.getSiteFileModDisableReason( selectedSite, 'modifyFiles' );
		if ( reasons && reasons.length > 0 ) {
			analytics.tracks.recordEvent( 'calypso_plans_autoconfig_halt_filemod', { error: reasons[ 0 ] } );
		} else if ( ! selectedSite.hasMinimumJetpackVersion ) {
			analytics.tracks.recordEvent(
				'calypso_plans_autoconfig_halt_jpversion',
				{ jetpack_version: selectedSite.options.jetpack_version }
			);
		} else if ( selectedSite.is_multisite && ! selectedSite.isMainNetworkSite() ) {
			analytics.tracks.recordEvent( 'calypso_plans_autoconfig_halt_multisite' );
		} else if ( selectedSite.options.is_multi_network ) {
			analytics.tracks.recordEvent( 'calypso_plans_autoconfig_halt_multinetwork' );
		}

		props.title = null;
		if ( ! selectedSite.canUpdateFiles ) {
			props.description = i18n.translate(
				'You can now install Akismet and VaultPress, which will automatically protect your site from spam and data loss. ' +
				'If you have any questions along the way, we\'re here to help!'
			);
			props.buttonText = i18n.translate( 'Installation Instructions' );
			props.href = 'https://en.support.wordpress.com/setting-up-premium-services/';
			props.onClick = trackManualInstall( 'calypso_plans_autoconfig_click_manual_install' );
		} else {
			props.description = i18n.translate(
				'We are about to install Akismet and VaultPress for your site, which will automatically protect your site from spam ' +
				'and data loss. If you have any questions along the way, we\'re here to help! You can also perform a manual ' +
				'installation by following {{a}}these instructions{{/a}}.',
				{ components: {
					a: <a
						target="_blank"
						href="https://en.support.wordpress.com/setting-up-premium-services/"
						onClick={ trackManualInstall( 'calypso_plans_autoconfig_click_opt_out' ) } />
				} }
			);
			props.buttonText = i18n.translate( 'Set up your plan' );
			props.href = `/plugins/setup/${selectedSite.slug}`;
		}
	}

	return (
		<PurchaseDetail { ...props }/>
	);
};

export default JetpackPlanDetails;
