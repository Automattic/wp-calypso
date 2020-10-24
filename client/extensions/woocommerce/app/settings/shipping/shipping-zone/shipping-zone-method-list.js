/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormToggle from 'calypso/components/forms/form-toggle';
import List from 'woocommerce/components/list/list';
import ListItem from 'woocommerce/components/list/list-item';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import ShippingZoneMethodDialog from './shipping-zone-method-dialog';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { getMethodSummary } from './shipping-methods/utils';
import { getShippingMethodNameMap } from 'woocommerce/state/sites/shipping-methods/selectors';
import {
	openShippingZoneMethod,
	addMethodToShippingZone,
	toggleShippingZoneMethodEnabled,
} from 'woocommerce/state/ui/shipping/zones/methods/actions';
import {
	getCurrentlyEditingShippingZoneMethods,
	getNewMethodTypeOptions,
} from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';
import { areShippingZonesFullyLoaded } from 'woocommerce/components/query-shipping-zones';
import {
	areSettingsGeneralLoaded,
	areSettingsGeneralLoadError,
} from 'woocommerce/state/sites/settings/general/selectors';

const ShippingZoneMethodList = ( {
	siteId,
	loaded,
	fetchError,
	methods,
	methodNamesMap,
	newMethodTypeOptions,
	currency,
	translate,
	actions,
} ) => {
	const renderMethod = ( method, index ) => {
		if ( ! loaded ) {
			return (
				<ListItem key={ index } className="shipping-zone__method is-placeholder">
					<ListItemField className="shipping-zone__method-title">
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__method-summary">
						<span />
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__enable-container">
						<span />
					</ListItemField>
					<ListItemField className="shipping-zone__method-actions">
						<Button compact>{ translate( 'Edit' ) }</Button>
					</ListItemField>
				</ListItem>
			);
		}

		const onEditClick = () => actions.openShippingZoneMethod( method.id );
		const onEnabledToggle = () =>
			actions.toggleShippingZoneMethodEnabled( method.id, ! method.enabled );

		return (
			<ListItem key={ index } className="shipping-zone__method">
				<ListItemField className="shipping-zone__method-title">{ method.title }</ListItemField>
				<ListItemField className="shipping-zone__method-summary">
					{ getMethodSummary( method, currency ) }
				</ListItemField>
				<ListItemField className="shipping-zone__enable-container">
					<FormToggle checked={ method.enabled } onChange={ onEnabledToggle }>
						{ translate( 'Enabled' ) }
					</FormToggle>
				</ListItemField>
				<ListItemField className="shipping-zone__method-actions">
					<Button compact onClick={ onEditClick }>
						{ translate( 'Edit' ) }
					</Button>
				</ListItemField>
			</ListItem>
		);
	};

	const onAddMethod = () => {
		if ( ! loaded ) {
			return;
		}

		const newType = newMethodTypeOptions[ 0 ];
		actions.addMethodToShippingZone( newType, methodNamesMap( newType ) );
	};

	let methodsToRender = loaded ? methods : [ {}, {}, {} ];
	if ( fetchError ) {
		methodsToRender = [];
	}

	return (
		<div className="shipping-zone__methods-container">
			<ExtendedHeader
				label={ translate( 'Shipping methods' ) }
				description={ translate(
					'These are the shipping methods available ' + 'to customers in the zone defined above.'
				) }
			>
				<Button onClick={ onAddMethod } disabled={ ! loaded }>
					{ translate( 'Add method' ) }
				</Button>
			</ExtendedHeader>
			<List>
				{ methodsToRender.length ? (
					<ListHeader>
						<ListItemField className="shipping-zone__methods-column-title">
							{ translate( 'Method' ) }
						</ListItemField>
						<ListItemField className="shipping-zone__methods-column-summary">
							{ translate( 'Cost' ) }
						</ListItemField>
					</ListHeader>
				) : null }
				{ methodsToRender.map( renderMethod ) }
			</List>
			<ShippingZoneMethodDialog siteId={ siteId } />
		</div>
	);
};

ShippingZoneMethodList.propTypes = {
	siteId: PropTypes.number,
};

export default connect(
	( state, ownProps ) => ( {
		methods: getCurrentlyEditingShippingZoneMethods( state, ownProps.siteId ),
		methodNamesMap: getShippingMethodNameMap( state, ownProps.siteId ),
		newMethodTypeOptions: getNewMethodTypeOptions( state, ownProps.siteId ),
		currency: getCurrencyWithEdits( state, ownProps.siteId ),
		loaded:
			areShippingZonesFullyLoaded( state, ownProps.siteId ) &&
			areSettingsGeneralLoaded( state, ownProps.siteId ),
		fetchError: areSettingsGeneralLoadError( state, ownProps.siteId ), // TODO: add shipping zones/methods fetch errors too
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId(
			{
				openShippingZoneMethod,
				addMethodToShippingZone,
				toggleShippingZoneMethodEnabled,
			},
			dispatch,
			ownProps.siteId
		),
	} )
)( localize( ShippingZoneMethodList ) );
