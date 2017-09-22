/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FlatRate from './shipping-methods/flat-rate';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle/compact';
import FreeShipping from './shipping-methods/free-shipping';
import LocalPickup from './shipping-methods/local-pickup';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import {
	getShippingMethodNameMap,
} from 'woocommerce/state/sites/shipping-methods/selectors';
import {
	changeShippingZoneMethodTitle,
	changeShippingZoneMethodType,
	cancelShippingZoneMethod,
	closeShippingZoneMethod,
	removeMethodFromShippingZone,
	toggleOpenedShippingZoneMethodEnabled,
} from 'woocommerce/state/ui/shipping/zones/methods/actions';
import {
	getMethodTypeChangeOptions,
	getCurrentlyOpenShippingZoneMethod,
	isCurrentlyOpenShippingZoneMethodNew,
} from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';

const ShippingZoneMethodDialog = ( {
		siteId,
		method,
		methodNamesMap,
		methodTypeOptions,
		translate,
		isVisible,
		isNew,
		currency,
		actions
	} ) => {
	if ( ! isVisible ) {
		return null;
	}

	const { enabled, methodType, title } = method;
	const onCancel = () => {
		actions.cancelShippingZoneMethod();
	};
	const onClose = () => {
		actions.closeShippingZoneMethod();
	};
	const onDelete = () => {
		actions.removeMethodFromShippingZone( method.id );
	};
	const onMethodTitleChange = ( event ) => ( actions.changeShippingZoneMethodTitle( event.target.value ) );
	const onMethodTypeChange = ( event ) => {
		const newType = event.target.value;
		actions.changeShippingZoneMethodType( newType, methodNamesMap( newType ) );
	};
	const onEnabledChange = () => ( actions.toggleOpenedShippingZoneMethodEnabled( ! enabled ) );

	const renderMethodTypeOptions = () => {
		return methodTypeOptions.map( ( newMethodId, index ) => (
			<option value={ newMethodId } key={ index }>{ methodNamesMap( newMethodId ) }</option>
		) );
	};

	const renderMethodSettingsView = () => {
		switch ( method.methodType ) {
			case 'flat_rate':
				return <FlatRate siteId={ siteId } currency={ currency } { ...method } />;
			case 'free_shipping':
				return <FreeShipping siteId={ siteId } currency={ currency } { ...method } />;
			case 'local_pickup':
				return <LocalPickup siteId={ siteId } currency={ currency } { ...method } />;
			default:
				return null;
		}
	};

	const buttons = [
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'add', label: isNew ? translate( 'Add' ) : translate( 'Done' ), onClick: onClose, isPrimary: true },
	];

	if ( ! isNew ) {
		buttons.unshift( {
			action: 'delete',
			label: <span><Gridicon icon="trash" /> { translate( 'Delete this method' ) }</span>,
			onClick: onDelete,
			additionalClassNames: 'shipping-zone__method-delete is-scary is-borderless'
		} );
	}

	return (
		<Dialog
			additionalClassNames="shipping-zone__method-dialog woocommerce"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCancel } >
			<div className="shipping-zone__method-dialog-header">
				{ isNew ? translate( 'Add shipping method' ) : translate( 'Edit shipping method' ) }
				<FormFieldSet className="shipping-zone__enable">
					<FormToggle checked={ enabled } onChange={ onEnabledChange }>{ translate( 'Enabled' ) }</FormToggle>
				</FormFieldSet>
			</div>
			<FormFieldSet>
				<FormFieldSet>
					<FormLabel>{ translate( 'Method' ) }</FormLabel>
					<FormSelect
						className="shipping-zone__method-type-select"
						value={ methodType }
						onChange={ onMethodTypeChange }>
						{ renderMethodTypeOptions() }
					</FormSelect>
				</FormFieldSet>
				<FormFieldSet>
					<FormLabel>{ translate( 'Title' ) }</FormLabel>
					<FormTextInput
						placeholder={ translate( 'Title' ) }
						value={ title || '' }
						onChange={ onMethodTitleChange } />
				</FormFieldSet>
				{ renderMethodSettingsView() }
			</FormFieldSet>
		</Dialog>
	);
};

ShippingZoneMethodDialog.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => {
		const method = getCurrentlyOpenShippingZoneMethod( state );

		return {
			method,
			isVisible: Boolean( method ),
			isNew: method && isCurrentlyOpenShippingZoneMethodNew( state ),
			methodNamesMap: getShippingMethodNameMap( state ),
			methodTypeOptions: method && getMethodTypeChangeOptions( state, method.methodType ),
			currency: getCurrencyWithEdits( state ),
		};
	},
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			changeShippingZoneMethodTitle,
			changeShippingZoneMethodType,
			cancelShippingZoneMethod,
			closeShippingZoneMethod,
			removeMethodFromShippingZone,
			toggleOpenedShippingZoneMethodEnabled,
		}, dispatch, ownProps.siteId )
	} )
)( localize( ShippingZoneMethodDialog ) );
