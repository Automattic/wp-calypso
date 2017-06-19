/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
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
import FormToggle from 'components/forms/form-toggle';
import FreeShipping from './shipping-methods/free-shipping';
import LocalPickup from './shipping-methods/local-pickup';
import {
	getMethodName,
} from 'woocommerce/state/ui/shipping/zones/methods/utils';
import {
	changeShippingZoneMethodTitle,
	changeShippingZoneMethodType,
	cancelShippingZoneMethod,
	closeShippingZoneMethod,
	removeMethodFromShippingZone,
	toggleShippingZoneMethodEnabled,
} from 'woocommerce/state/ui/shipping/zones/methods/actions';
import {
	getMethodTypeChangeOptions,
	getCurrentlyOpenShippingZoneMethod
} from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneDialog = ( { siteId, method, methodTypeOptions, translate, isVisible, onChange, actions } ) => {
	if ( ! isVisible ) {
		return null;
	}

	const { enabled, methodType, title, } = method;
	const onCancel = () => ( actions.cancelShippingZoneMethod( siteId ) );
	const onClose = () => {
		onChange();
		actions.closeShippingZoneMethod( siteId );
	};
	const onDelete = () => {
		onChange();
		actions.removeMethodFromShippingZone( siteId, method.id );
	};
	const onMethodTitleChange = ( event ) => ( actions.changeShippingZoneMethodTitle( siteId, event.target.value ) );
	const onMethodTypeChange = ( event ) => ( actions.changeShippingZoneMethodType( siteId, event.target.value ) );
	const onEnabledChange = () => ( actions.toggleShippingZoneMethodEnabled( siteId, ! enabled ) );

	const renderMethodTypeOptions = () => {
		return methodTypeOptions.map( ( newMethodId, index ) => (
			<option value={ newMethodId } key={ index }>{ getMethodName( newMethodId ) }</option>
		) );
	};

	const renderMethodSettingsView = () => {
		switch ( method.methodType ) {
			case 'flat_rate':
				return <FlatRate siteId={ siteId } { ...method } />;
			case 'free_shipping':
				return <FreeShipping siteId={ siteId } { ...method } />;
			case 'local_pickup':
				return <LocalPickup siteId={ siteId } { ...method } />;
			default:
				return null;
		}
	};

	const buttons = [
		{
			action: 'delete',
			label: <span><Gridicon icon="trash" /> { translate( 'Delete this method' ) }</span>,
			onClick: onDelete,
			additionalClassNames: 'shipping-zone__method-delete is-borderless'
		},
		{ action: 'cancel', label: translate( 'Cancel' ) },
		{ action: 'add', label: translate( 'Save' ), onClick: onClose, isPrimary: true },
	];

	return (
		<Dialog
			additionalClassNames="shipping-zone__method-dialog woocommerce"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onCancel } >
			<div className="shipping-zone__method-dialog-header">
				{ translate( 'Edit shipping method' ) }
			</div>
			<FormFieldSet>
				<FormFieldSet>
					<FormSelect
						className="shipping-zone__method-type-select"
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
								toggle: <FormToggle checked={ enabled } onChange={ onEnabledChange } />
							}
						} ) }
					</FormLabel>
				</FormFieldSet>
				{ renderMethodSettingsView( method, siteId ) }
			</FormFieldSet>
		</Dialog>
	);
};

ShippingZoneDialog.propTypes = {
	siteId: PropTypes.number,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state ) => {
		const method = getCurrentlyOpenShippingZoneMethod( state );

		return {
			method,
			isVisible: Boolean( method ),
			methodTypeOptions: method && getMethodTypeChangeOptions( state, method.methodType ),
		};
	},
	( dispatch ) => ( {
		actions: bindActionCreators( {
			changeShippingZoneMethodTitle,
			changeShippingZoneMethodType,
			cancelShippingZoneMethod,
			closeShippingZoneMethod,
			removeMethodFromShippingZone,
			toggleShippingZoneMethodEnabled,
		}, dispatch )
	} )
)( localize( ShippingZoneDialog ) );
