/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { groupBy, map } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import ShippingServiceGroup from './group';
import FormLegend from 'components/forms/form-legend';
import FieldError from 'woocommerce/woocommerce-services/components/field-error';
import FieldDescription from 'woocommerce/woocommerce-services/components/field-description';
import sanitizeHTML from 'woocommerce/woocommerce-services/lib/utils/sanitize-html';

const ShippingServiceGroups = ( {
	title,
	description,
	services,
	settings,
	currencySymbol,
	updateValue,
	settingsKey,
	errors,
	generalError,
} ) => {
	// Some shippers have so many services that it is helpful to organize them
	// into groups.  This code iterates over the services and extracts the group(s)
	// it finds.  When rendering, we can then iterate over the group(s).
	const servicesWithSettings = services.map( svc => Object.assign( {}, svc, settings[ svc.id ] ) );
	const serviceGroups = groupBy( servicesWithSettings, svc => svc.group );

	const renderServiceGroup = ( serviceGroup ) => {
		const groupFields = map( serviceGroups[ serviceGroup ], 'id' );
		const groupErrors = {};
		groupFields.forEach( ( fieldName ) => {
			if ( errors[ fieldName ] ) {
				groupErrors[ fieldName ] = errors[ fieldName ];
			}
		} );

		return (
			<ShippingServiceGroup
				key={ serviceGroup }
				title={ serviceGroups[ serviceGroup ][ 0 ].group_name }
				deliveryEstimate={ serviceGroups[ serviceGroup ][ 0 ].group_estimate || false }
				services={ serviceGroups[ serviceGroup ] }
				currencySymbol={ currencySymbol }
				updateValue={ updateValue }
				settingsKey={ settingsKey }
				errors={ groupErrors }
			/>
		);
	};

	return (
		<div className="shipping-services">
			<FormLegend dangerouslySetInnerHTML={ sanitizeHTML( title ) } />
			<FieldDescription text={ description } />
			<div className={ classNames( 'shipping-services__inner', { 'is-error': generalError } ) }>
				{ Object.keys( serviceGroups ).sort().map( renderServiceGroup ) }
			</div>
			{ generalError ? <FieldError text={ generalError } /> : null }
		</div>
	);
};

ShippingServiceGroups.propTypes = {
	title: PropTypes.string,
	description: PropTypes.string,
	services: PropTypes.array.isRequired,
	settings: PropTypes.object.isRequired,
	currencySymbol: PropTypes.string,
	updateValue: PropTypes.func.isRequired,
	settingsKey: PropTypes.string.isRequired,
};

ShippingServiceGroups.defaultProps = {
	currencySymbol: '$',
	settings: {},
};

export default ShippingServiceGroups;
