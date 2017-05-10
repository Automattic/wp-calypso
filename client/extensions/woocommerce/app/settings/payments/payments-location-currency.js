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

class SettingsPaymentsLocationCurrency extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Store Location and Currency' ) } />
				<Card>
					{
						translate(
							'Different payment methods may be available based on your store location and currency.'
						)
					}
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsLocationCurrency );
