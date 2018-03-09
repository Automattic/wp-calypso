/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import { get, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
import Dropdown from 'woocommerce/woocommerce-services/components/dropdown';
import formatCurrency from 'lib/format-currency';
import { updateRate } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import {
	getShippingLabel,
	isLoaded,
	getFormErrors,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';

class RateSelector extends React.Component {
	static propTypes = {
		packageId: PropTypes.string.isRequired,
		packageName: PropTypes.string,
		selectedRate: PropTypes.string.isRequired,
		packageRates: PropTypes.arrayOf( PropTypes.object ).isRequired,
		errors: PropTypes.object.isRequired,
		updateRate: PropTypes.func.isRequired,
	};

	getTitle = () => {
		const { packageName, translate } = this.props;
		if ( ! packageName ) {
			return translate( 'Choose rate' );
		}
		return translate( 'Choose rate: %(pckg)s', { args: { pckg: packageName } } );
	};

	render() {
		const {
			orderId,
			siteId,
			isLoading,
			packageId,
			packageName,
			id,
			selectedRate,
			packageRates,
			errors,
			translate,
		} = this.props;

		const valuesMap = { '': translate( 'Select one…' ) };
		const serverErrors = errors.server && errors.server[ packageId ];
		const formError = errors.form && errors.form[ packageId ];

		packageRates.forEach( rateObject => {
			valuesMap[ rateObject.service_id ] =
				rateObject.title + ' (' + formatCurrency( rateObject.rate, 'USD' ) + ')';
		} );

		const onRateUpdate = value => this.props.updateRate( orderId, siteId, packageId, value );
		return (
			<div
				className={ classNames(
					'rates-step__rate-selector',
					isLoading && 'rates-step__placeholder'
				) }
			>
				{ serverErrors &&
					isEmpty( packageRates ) &&
					packageName && <p className="rates-step__package-heading">{ packageName }</p> }
				{ ( ! isEmpty( packageRates ) || isLoading ) && (
					<Dropdown
						id={ id }
						valuesMap={ valuesMap }
						title={ this.getTitle() }
						value={ selectedRate }
						updateValue={ onRateUpdate }
						error={ formError }
					/>
				) }
				{ serverErrors &&
					serverErrors.map( ( serverError, index ) => (
						<FieldError type="server-error" key={ index } text={ serverError } />
					) ) }
			</div>
		);
	}
}

const mapStateToProps = ( state, { orderId, siteId, packageId } ) => {
	const loaded = isLoaded( state, orderId, siteId );
	const shippingLabel = getShippingLabel( state, orderId, siteId );
	const ratesForm = shippingLabel.form.rates;
	return {
		isLoading: ratesForm.retrievalInProgress,
		errors: loaded && getFormErrors( state, orderId, siteId ).rates,
		selectedRate: ratesForm.values[ packageId ] || '', // Store owner selected rate, not customer
		packageRates: get( ratesForm.available, [ packageId, 'rates' ], [] ),
	};
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators( { updateRate }, dispatch );
};

export default connect( mapStateToProps, mapDispatchToProps )( localize( RateSelector ) );
