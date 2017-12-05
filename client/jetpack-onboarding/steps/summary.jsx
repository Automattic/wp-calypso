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

class JetpackOnboardingSummaryStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( 'Congratulations! Your site is on its way.' );
		const subHeaderText = translate(
			'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing your site below.'
		);

		return <FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />;
	}
}

export default localize( JetpackOnboardingSummaryStep );
