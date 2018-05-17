/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';

export class InstallmentsPlanPicker extends React.Component {
	static propTypes = {
		initialValue: PropTypes.number,
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
			plan.label = plan.value + ' x ' + plan.payment;
			return plan;
		} );
	}

	handleInstallmentsInput = event => {
		const installments = parseInt( event.target.value );

		this.setState( {
			userChangedInstallments: true,
			installmentsInputValue: installments,
		} );

		this.props.onChange( installments );

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

export default localize( InstallmentsPlanPicker );
