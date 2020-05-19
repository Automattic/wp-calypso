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
import { successNotice, errorNotice } from 'state/notices/actions';
import * as FormValueActions from 'woocommerce/woocommerce-services/state/service-settings/actions';
import getFormErrors from 'woocommerce/woocommerce-services/state/service-settings/selectors/errors';
import { getShippingMethodSchema } from 'woocommerce/woocommerce-services/state/shipping-method-schemas/selectors';
import { getCurrentlyOpenShippingZoneMethod } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getSite } from 'state/sites/selectors';
import { getShippingClassOptions } from 'woocommerce/state/sites/shipping-classes/selectors';

const SettingsForm = ( props ) => {
	const renderGroup = ( index ) => {
		return <SettingsGroup { ...props } group={ props.layout[ index ] } key={ index } />;
	};

	return <div>{ props.layout.map( ( group, idx ) => renderGroup( idx ) ) }</div>;
};

SettingsForm.propTypes = {
	siteId: PropTypes.number.isRequired,
	method: PropTypes.object.isRequired,
};

function mapStateToProps( state, props ) {
	const { storeOptions, formSchema, formLayout } = getShippingMethodSchema(
		state,
		props.method.methodType,
		props.siteId
	);
	return {
		formData: getCurrentlyOpenShippingZoneMethod( state, props.siteId ),
		shippingClasses: getShippingClassOptions( state, props.siteId ),
		errors: getFormErrors( state, props.siteId ),
		storeOptions,
		schema: formSchema,
		layout: formLayout,
		site: getSite( state, props.siteId ),
	};
}

function mapDispatchToProps( dispatch, ownProps ) {
	return {
		noticeActions: bindActionCreators( { successNotice, errorNotice }, dispatch ),
		formValueActions: {
			updateField: ( path, value ) =>
				dispatch(
					FormValueActions.updateField( ownProps.siteId, ownProps.method.id, path, value )
				),
		},
	};
}

export default connect( mapStateToProps, mapDispatchToProps )( SettingsForm );
