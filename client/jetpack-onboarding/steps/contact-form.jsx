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

class JetpackOnboardingContactFormStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'Would you like to get started with a Contact Us page?' );

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default localize( JetpackOnboardingContactFormStep );
