/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import analytics from 'lib/analytics';
import { getCurrentUserCurrencyCode } from 'state/current-user/selectors';
import formatCurrency from 'lib/format-currency';
import { CURRENCIES } from 'lib/format-currency/currencies';

export class InstallmentsPlanPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.number,
		currencyCode: PropTypes.oneOf( Object.keys( CURRENCIES ) ).isRequired,
		plans: PropTypes.array.isRequired,
		onChange: PropTypes.func,
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		onChange: () => null,
	};

	state = {
		installmentsInputValue: this.props.initialValue,
	};

	formatPlans() {
		return this.props.plans.map( plan => {
			plan.label = plan.value + ' x ' + myFormatCurrency( plan.payment, this.props.currencyCode );
			return plan;
		} );
	}

	handleInstallmentsInput = event => {
		this.setState( {
			userChangedInstallments: true,
			installmentsInputValue: event.target.value,
		} );

		analytics.tracks.recordEvent( 'calypso_checkout_installments_submit', {
			installments: this.state.installmentsInputValue,
		} );

		this.props.onChange( event.target.value );

		this.setState( {
			userChangedInstallments: false,
		} );
	};

	render() {
		const installmentPlans = this.formatPlans();

		return (
			<div className="installments-plan-picker">
				<div className="installments-plan-picker__header">
					{ this.props.translate( 'Choose an installments plan', {
						comment:
							'In some countries, customers can choose ' +
							'an installments plan when paying with credit cards',
					} ) }
				</div>
				<div className="installments-plan-picker__options">
					{ installmentPlans.map( ( { value, label } ) => {
						const checked = this.state.installmentsInputValue === value,
							className = classnames( 'installments-plan-picker__option', {
								'is-active': checked,
							} );

						return (
							<div className="installments-plan-picker__option-container" key={ value }>
								<FormLabel className={ className } key={ value }>
									<FormRadio
										checked={ checked }
										value={ value }
										onChange={ this.handleInstallmentsInput }
									/>
									<span>{ label }</span>
								</FormLabel>
							</div>
						);
					} ) }
				</div>
			</div>
		);
	}
}

export function myFormatCurrency( price, code ) {
	const precision = CURRENCIES[ code ].precision;
	const EPSILON = Math.pow( 10, -precision ) - 0.000000001;

	const hasCents = Math.abs( price % 1 ) >= EPSILON;
	return formatCurrency( price, code, hasCents ? {} : { precision: 0 } );
}

export const mapStateToProps = state => {
	return {
		currencyCode: getCurrentUserCurrencyCode( state ),
	};
};

export default connect( mapStateToProps )( localize( InstallmentsPlanPicker ) );
