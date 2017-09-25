/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SegmentedControl from 'components/segmented-control';
import ControlItem from 'components/segmented-control/item';

class StripeConnectPrompt extends Component {
	static propTypes = {
		isCreateSelected: PropTypes.bool.isRequired,
		onSelectCreate: PropTypes.func.isRequired,
		onSelectConnect: PropTypes.func.isRequired,
	}

	render = () => {
		const { isCreateSelected, onSelectCreate, onSelectConnect, translate } = this.props;

		return (
			<div className="stripe__connect-prompt">
				<SegmentedControl primary>
					<ControlItem
						selected={ isCreateSelected }
						onClick={ onSelectCreate }
					>
						{ translate( 'New Stripe account' ) }
					</ControlItem>
					<ControlItem
						selected={ ! isCreateSelected }
						onClick={ onSelectConnect }
					>
						{ translate( 'I already have a Stripe account' ) }
					</ControlItem>
				</SegmentedControl>
				<p>
					{
						translate( 'To start accepting payments with Stripe, you need to connect ' +
							'your WordPress.com account to a Stripe account.' )
					}
				</p>
			</div>
		);
	}
}

export default localize( StripeConnectPrompt );
