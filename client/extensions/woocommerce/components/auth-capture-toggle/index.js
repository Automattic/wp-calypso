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
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';

class AuthCaptureToggle extends Component {
	static propTypes = {
		isAuthOnlyMode: PropTypes.bool.isRequired,
		onSelectAuthOnly: PropTypes.func.isRequired,
		onSelectCapture: PropTypes.func.isRequired,
	};

	render = () => {
		const { isAuthOnlyMode, onSelectAuthOnly, onSelectCapture, translate } = this.props;

		return (
			<FormFieldset className="auth-capture-toggle__container">
				<FormLegend>{ translate( 'Payment authorization' ) }</FormLegend>
				<FormLabel>
					<FormRadio
						name="capture"
						value="yes"
						checked={ ! isAuthOnlyMode }
						onChange={ onSelectCapture }
					/>
					<span>
						{ translate( 'Authorize and charge the customers credit card automatically' ) }
					</span>
				</FormLabel>
				<FormLabel>
					<FormRadio
						name="capture"
						value="no"
						checked={ isAuthOnlyMode }
						onChange={ onSelectAuthOnly }
					/>
					<span>{ translate( "Authorize the customer's credit card but charge manually" ) }</span>
				</FormLabel>
			</FormFieldset>
		);
	};
}

export default localize( AuthCaptureToggle );
