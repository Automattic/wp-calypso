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

class SettingsPaymentsOffline extends Component {

	static propTypes = {
		className: PropTypes.string,
	};

	render() {
		const { translate } = this.props;
		return (
			<div>
				<SectionHeader label={ translate( 'Offline payment methods' ) } />
				<Card>
					{
						translate(
							'Allow customers to pay you manually using methods like bank ' +
							'transfer, cheque or cash on delivery.'
						)
					}
				</Card>
			</div>
		);
	}

}

export default localize( SettingsPaymentsOffline );
