/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import Gridicon from 'calypso/components/gridicon';
import { localize } from 'i18n-calypso';
import { omit } from 'lodash';
import { getCurrencyObject } from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormCurrencyInput from 'calypso/components/forms/form-currency-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { getPaymentCurrencySettings } from 'woocommerce/state/sites/settings/general/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

class PriceInput extends Component {
	static propTypes = {
		currency: PropTypes.string,
		currencySetting: PropTypes.shape( {
			value: PropTypes.string,
		} ),
		initialValue: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
		name: PropTypes.string,
		value: PropTypes.oneOfType( [ PropTypes.number, PropTypes.string ] ),
	};

	constructor( props ) {
		super( props );

		this.state = {
			value: props.value,
		};
	}

	UNSAFE_componentWillReceiveProps( { value } ) {
		this.setState( { value } );
	}

	resetToInitial = () => {
		const { initialValue, name = '' } = this.props;
		this.setState( { value: initialValue }, () => {
			// All uses of onChange expect an event object of this shape
			this.props.onChange( {
				target: {
					name,
					value: initialValue.toString(),
				},
			} );
		} );
	};

	render() {
		const {
			currency,
			currencySetting,
			initialValue,
			siteId,
			translate,
			value,
			...props
		} = this.props;

		const displayCurrency = ! currency && currencySetting ? currencySetting.value : currency;
		const currencyObject = getCurrencyObject( value, displayCurrency );
		let resetButton;
		if ( initialValue ) {
			if ( initialValue === this.state.value ) {
				resetButton = <span />;
			} else {
				resetButton = (
					<Button
						onClick={ this.resetToInitial }
						compact
						borderless
						aria-label={ translate( 'Reset to %(value)s', { args: { value: initialValue } } ) }
					>
						<Gridicon icon="refresh" />
					</Button>
				);
			}
		}

		const classes = classNames( 'price-input', { 'has-reset': !! initialValue } );
		return (
			<div className={ classes }>
				<QuerySettingsGeneral siteId={ siteId } />
				{ currencyObject ? (
					<FormCurrencyInput
						currencySymbolPrefix={ currencyObject.symbol }
						currencySymbolSuffix={ resetButton }
						value={ this.state.value }
						{ ...omit( props, [ 'dispatch', 'moment', 'numberFormat' ] ) }
					/>
				) : (
					<FormTextInput value={ this.state.value } { ...omit( props, [ 'noWrap', 'min' ] ) } />
				) }
			</div>
		);
	}
}

function mapStateToProps( state ) {
	const siteId = getSelectedSiteId( state );
	const currencySetting = getPaymentCurrencySettings( state );
	return {
		siteId,
		currencySetting,
	};
}

export default connect( mapStateToProps )( localize( PriceInput ) );
