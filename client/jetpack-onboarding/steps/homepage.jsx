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

class JetpackOnboardingHomepageStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( "Let's shape your new site." );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default localize( JetpackOnboardingHomepageStep );
