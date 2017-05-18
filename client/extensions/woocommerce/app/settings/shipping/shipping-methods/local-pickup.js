/**
 * External dependencies
 */
import React, { Component } from 'react';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormCurrencyInput from 'components/forms/form-currency-input';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import Tooltip from 'components/tooltip';

class LocalPickupMethod extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			showTooltip: false,
			currencySymbolPrefix: '$',
			currencySymbolSuffix: '',
			...props
		};
	}

	render() {
		const { translate } = this.props;

		const toggleTooltip = () => {
			this.setState( { showTooltip: ! this.state.showTooltip } );
		};

		return (
			<div className="shipping-methods__method-container shipping-methods__local-pickup">
				<FormFieldSet>
					<FormLabel>{ translate( 'How much will you charge for local pickup?' ) }</FormLabel>
					<FormCurrencyInput
						currencySymbolPrefix={ this.state.currencySymbolPrefix }
						currencySymbolSuffix={ this.state.currencySymbolSuffix }
						value={ this.state.price } />
				</FormFieldSet>
				<FormFieldSet>
					<FormCheckbox
						checked={ this.state.taxable }
						className="shipping-methods__local-pickup-taxable" />
					{ translate( 'Taxable' ) }
					<span
						className="shipping-methods__local-pickup-taxable-help"
						ref="taxableHelp"
						onMouseEnter={ toggleTooltip }
						onMouseLeave={ toggleTooltip } >
					<Gridicon icon="help-outline" size={ 18 } />
					</span>
					<Tooltip
						isVisible={ this.state.showTooltip }
						context={ this.refs && this.refs.taxableHelp }
						className="shipping-methods__local-pickup-taxable-tooltip is-dialog-visible"
						position="top">
						{ translate( 'Taxable explanation' ) }
					</Tooltip>
				</FormFieldSet>
			</div>
		);
	}
}

export default localize( LocalPickupMethod );
