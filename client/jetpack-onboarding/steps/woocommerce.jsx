/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormattedHeader from 'components/formatted-header';

class JetpackOnboardingWoocommerceStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( 'Are you looking to sell online?' );
		const subHeaderText = translate(
			"We'll set you up with WooCommerce for all of your online selling needs."
		);

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default localize( JetpackOnboardingWoocommerceStep );
