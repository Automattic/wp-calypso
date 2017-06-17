/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormToggle from 'components/forms/form-toggle';
import {
	getMethodName,
	renderMethodSettingsView,
} from './utils';
import {
	changeShippingZoneMethodTitle,
	changeShippingZoneMethodType,
	cancelShippingZoneMethod,
	closeShippingZoneMethod
} from 'woocommerce/state/ui/shipping/zones/methods/actions';
import {
	getNewMethodTypeOptions,
	getCurrentlyOpenShippingZoneMethod
} from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneDialog = ( { siteId, method, newMethodTypeOptions, translate, isVisible, actions } ) => {
	if ( ! isVisible ) {
		return null;
	}

	const { id, enabled, methodType, title, } = method;
	const onCancel = () => ( actions.cancelShippingZoneMethod( siteId ) );
	const onClose = () => ( actions.closeShippingZoneMethod( siteId ) );
	const onMethodTitleChange = ( event ) => ( actions.changeShippingZoneMethodTitle( siteId, id, event.target.value ) );
	const onMethodTypeChange = ( event ) => ( actions.changeShippingZoneMethodType( siteId, id, event.target.value ) );

	const renderMethodTypeOptions = () => {
		const options = newMethodTypeOptions.map( ( newMethodId, index ) => (
			<option value={ newMethodId } key={ index }>{ getMethodName( newMethodId ) }</option>
		) );

		if ( ! includes( newMethodTypeOptions, methodType ) ) {
			options.unshift( <option value={ methodType } key={ -1 }>{ getMethodName( methodType ) }</option> );
		}

		return options;
	};

	const buttons = [
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
				{ renderMethodSettingsView( method, siteId ) }
			</FormFieldSet>
		</Dialog>
	);
};

ShippingZoneDialog.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state ) => {
		const method = getCurrentlyOpenShippingZoneMethod( state );

		return {
			method,
			isVisible: Boolean( method ),
			newMethodTypeOptions: getNewMethodTypeOptions( state ),
		};
	},
	( dispatch ) => ( {
		actions: bindActionCreators( {
			changeShippingZoneMethodTitle,
			changeShippingZoneMethodType,
			cancelShippingZoneMethod,
			closeShippingZoneMethod,
		}, dispatch )
	} )
)( localize( ShippingZoneDialog ) );
