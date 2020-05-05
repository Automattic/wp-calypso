/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

class StripeConnectPrompt extends Component {
	static propTypes = {
		isCreateSelected: PropTypes.bool.isRequired,
		onSelectCreate: PropTypes.func.isRequired,
		onSelectConnect: PropTypes.func.isRequired,
	};

	render() {
		const { isCreateSelected, onSelectCreate, onSelectConnect, translate } = this.props;

		return (
			<div className="stripe__connect-prompt">
				<p>
					{ translate(
						'To start accepting payments with Stripe, you need to connect ' +
							'your WordPress.com account to a Stripe account.'
					) }
				</p>
				<FormFieldset>
					<FormLabel>
						<FormRadio
							value={ isCreateSelected }
							checked={ isCreateSelected }
							onChange={ onSelectCreate }
						/>
						<span>{ translate( 'Create a new Stripe account' ) }</span>
					</FormLabel>

					<FormLabel>
						<FormRadio
							value={ ! isCreateSelected }
							checked={ ! isCreateSelected }
							onChange={ onSelectConnect }
						/>
						<span>{ translate( 'I already have a Stripe account' ) }</span>
					</FormLabel>
				</FormFieldset>
			</div>
		);
	}
}

export default localize( StripeConnectPrompt );
