/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormattedHeader from 'components/formatted-header';
import Main from 'components/main';

class JetpackOnboardingWoocommerceStep extends React.PureComponent {
	render() {
		const { translate } = this.props;
		const headerText = translate( 'Are you looking to sell online?' );
		const subHeaderText = translate(
			"We'll set you up with WooCommerce for all of your online selling needs."
		);

		return (
			<Main>
				<FormattedHeader headerText={ headerText } subHeaderText={ subHeaderText } />

				<div className="steps__button-group">
					<Button primary>{ translate( 'Yes, I am' ) }</Button>
					<Button>{ translate( 'Not right now' ) }</Button>
				</div>
			</Main>
		);
	}
}

export default localize( JetpackOnboardingWoocommerceStep );
