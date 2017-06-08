/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { includes } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FlatRate from './shipping-methods/flat-rate';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle';
import FormSelect from 'components/forms/form-select';
import FreeShipping from './shipping-methods/free-shipping';
import LocalPickup from './shipping-methods/local-pickup';
import { getNewMethodTypeOptions } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import {
	changeShippingZoneMethodTitle,
	changeShippingZoneMethodType
} from 'woocommerce/state/ui/shipping/zones/methods/actions';

const ShippingZoneMethod = ( { siteId, id, enabled, methodType, newMethodTypeOptions, title, translate, actions, ...props } ) => {
	const renderMethodSettings = () => {
		switch ( methodType ) {
			case 'flat_rate':
				return <FlatRate id={ id } siteId={ siteId } { ...props } />;
			case 'free_shipping':
				return <FreeShipping id={ id } siteId={ siteId } { ...props } />;
			case 'local_pickup':
				return <LocalPickup id={ id } siteId={ siteId } { ...props } />;
			default:
				return null;
		}
	};

	const getMethodName = ( type ) => {
		switch ( type ) {
			case 'flat_rate':
				return translate( 'Flat Rate' );
			case 'free_shipping':
				return translate( 'Free Shipping' );
			case 'local_pickup':
				return translate( 'Local Pickup' );
			default:
				return translate( 'Unknown shipping method' );
		}
	};

	const renderMethodTypeOptions = () => {
		const options = newMethodTypeOptions.map( ( newMethodId, index ) => (
			<option value={ newMethodId } key={ index }>{ getMethodName( newMethodId ) }</option>
		) );

		if ( ! includes( newMethodTypeOptions, methodType ) ) {
			options.unshift( <option value={ methodType } key={ -1 }>{ getMethodName( methodType ) }</option> );
		}

		return options;
	};

	const onMethodTitleChange = ( event ) => ( actions.changeShippingZoneMethodTitle( siteId, id, event.target.value ) );
	const onMethodTypeChange = ( event ) => ( actions.changeShippingZoneMethodType( siteId, id, event.target.value ) );

	return (
		<div className="shipping__method-container">
			<FormFieldSet>
				<FormSelect
					value={ methodType }
					onChange={ onMethodTypeChange }>
					{ renderMethodTypeOptions() }
				</FormSelect>
			</FormFieldSet>
			<FormFieldSet>
				<FormLabel>{ translate( 'Title:' ) }</FormLabel>
				<FormTextInput
					placeholder={ translate( 'Title' ) }
					value={ title || '' }
					onChange={ onMethodTitleChange } />
			</FormFieldSet>
			<FormFieldSet>
				<FormLabel>
					{ translate( 'Enabled: {{toggle/}}', {
						components: {
							toggle: <FormToggle checked={ enabled } />
						}
					} ) }
				</FormLabel>
			</FormFieldSet>
			{ renderMethodSettings() }
		</div>
	);
};

ShippingZoneMethod.propTypes = {
	siteId: PropTypes.number,
	zoneId: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	enabled: PropTypes.bool,
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	methodType: PropTypes.string,
	title: PropTypes.string,
	settings: PropTypes.object,
};

export default connect(
	( state ) => ( {
		newMethodTypeOptions: getNewMethodTypeOptions( state )
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators( {
			changeShippingZoneMethodTitle,
			changeShippingZoneMethodType
		}, dispatch )
	} )
)( localize( ShippingZoneMethod ) );
