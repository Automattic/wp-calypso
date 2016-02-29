/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import PurchaseDetail from 'components/purchase-detail';
import userFactory from 'lib/user';

const user = userFactory();

const JetpackPlanDetails = () => {
	return (
		<PurchaseDetail
			icon="cog"
			title={ i18n.translate( 'Set up your VaultPress and Akismet accounts' ) }
			description={
				i18n.translate(
					'We emailed you at %(email)s with information for setting up Akismet and VaultPress on your site. Follow the instructions in the email to get started.',
					{ args: { email: user.get().email } }
				)
			} />
	);
};

export default JetpackPlanDetails;
