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

class JetpackOnboardingBusinessAddressStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( 'Add a business address.' );
		const subHeaderText = translate(
			'Enter your business address to have a map added to your website.'
		);

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default localize( JetpackOnboardingBusinessAddressStep );
