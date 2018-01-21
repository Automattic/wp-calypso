/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import SettingsGroup from './settings-group';
import * as FormActions from 'woocommerce/woocommerce-services/state/service-settings/actions';
import { successNotice, errorNotice } from 'state/notices/actions';
import * as FormValueActions from 'woocommerce/woocommerce-services/state/service-settings/values/actions';
import getFormErrors from 'woocommerce/woocommerce-services/state/service-settings/selectors/errors';
import { getShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';
import { getCurrentlyOpenShippingZoneMethod } from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const SettingsForm = ( props ) => {
	const renderGroup = ( index ) => {
		return (
			<SettingsGroup
				{ ...props }
				group={ props.layout[ index ] }
				saveForm={ props.formValueActions.submit }
				key={ index }
			/>
		);
	};

	return (
		<div>
			{ props.layout.map( ( group, idx ) => renderGroup( idx ) ) }
		</div>
	);
};

SettingsForm.propTypes = {
	loaded: PropTypes.bool.isRequired,
	storeOptions: PropTypes.object,
	schema: PropTypes.object,
	layout: PropTypes.array,
};

function mapStateToProps( state, props ) {
	return {
		form: getShippingSettingsForm( state ),
		errors: props.loaded && getFormErrors( state, props.schema ),
	};
}

function mapDispatchToProps( dispatch ) {
	return {
		formActions: bindActionCreators( FormActions, dispatch ),
		noticeActions: bindActionCreators( { successNotice, errorNotice }, dispatch ),
		formValueActions: bindActionCreators( FormValueActions, dispatch ),
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)( SettingsForm );
