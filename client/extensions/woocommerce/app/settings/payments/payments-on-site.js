/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class SettingsPaymentsOnSite extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'On-site credit card payment methods' ) } />
				<Card>
					{
						translate(
							'On-site methods provide a seamless experience by keeping the ' +
							'customer on your site to enter their credit card details and ' +
							'complete checkout. More information'
						)
					}
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOnSite );
