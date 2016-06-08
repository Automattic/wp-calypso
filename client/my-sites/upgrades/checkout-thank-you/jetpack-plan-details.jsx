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

var config = require( 'config' );

const user = userFactory();

var JetpackPlanDetails = ( { selectedSite } ) => {
	const props = {
		icon: 'cog',
		title: i18n.translate( 'Set up your VaultPress and Akismet accounts' ),
		description: i18n.translate(
			'We emailed you at %(email)s with information for setting up Akismet and VaultPress on your site. Follow the instructions in the email to get started.',
			{ args: { email: user.get().email } }
		),
	};

	if ( config.isEnabled( 'manage/plugins/setup' ) ) {
		props.title = null;
		props.description = i18n.translate(
			'We are about to install Akismet and VaultPress for your site, which will automatically protect your site from spam and data loss. If you have any questions along the way, we\'re here to help! You can also perform a manual installation by following {{a}}these instructions{{/a}}.',
			{ components: {
				a: <a target="_blank" href="https://en.support.wordpress.com/setting-up-premium-services/" />
			} }
		);
		props.buttonText = i18n.translate( 'Set up your plan' );
		props.href = `/plugins/setup/${selectedSite.slug}`;
	}

	return (
		<PurchaseDetail { ...props }/>
	);
};

export default JetpackPlanDetails;
