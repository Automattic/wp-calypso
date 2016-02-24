/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from './purchase-detail';

const JetpackBusinessPlanDetails = () => {
	return (
		<div>
			<PurchaseDetail
				additionalClass="akismet"
				title={ i18n.translate( 'Akismet' ) }
				description={ i18n.translate( 'Say goodbye to comment spam' ) }
				buttonText={ i18n.translate( 'Start using Akismet' ) }
				href="https://support.wordpress.com/setting-up-premium-services/"
				target="_blank" />

			<PurchaseDetail
				additionalClass="vaultpress"
				title={ i18n.translate( 'VaultPress' ) }
				description={ i18n.translate( 'Backup your site' ) }
				buttonText={ i18n.translate( 'Start using VaultPress' ) }
				href="https://support.wordpress.com/setting-up-premium-services/"
				target="_blank" />

			<PurchaseDetail
				additionalClass="polldaddy"
				title={ i18n.translate( 'PollDaddy' ) }
				description={ i18n.translate( 'Create surveys and polls' ) }
				buttonText={ i18n.translate( 'Start using PollDaddy' ) }
				href="https://support.wordpress.com/setting-up-premium-services/"
				target="_blank" />
		</div>
	);
};

export default JetpackBusinessPlanDetails;
