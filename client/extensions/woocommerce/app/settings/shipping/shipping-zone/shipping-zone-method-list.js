/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import FormToggle from 'components/forms/form-toggle/compact';
import List from 'woocommerce/components/list/list';
import ListItem from 'woocommerce/components/list/list-item';
import ListHeader from 'woocommerce/components/list/list-header';
import ListItemField from 'woocommerce/components/list/list-item-field';
import ShippingZoneMethodDialog from './shipping-zone-method-dialog';
import { bindActionCreatorsWithSiteId } from 'woocommerce/lib/redux-utils';
import { getMethodSummary } from './shipping-methods/utils';
import {
	getShippingMethodNameMap,
} from 'woocommerce/state/sites/shipping-methods/selectors';
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

const ShippingZoneMethodList = ( {
		siteId,
		loaded,
		methods,
		methodNamesMap,
		newMethodTypeOptions,
		currency,
		translate,
		onChange,
		actions,
	} ) => {
	const renderMethod = ( method, index ) => {
		if ( ! loaded ) {
			return (
				<ListItem key={ index } className="shipping-zone__method is-placeholder" >
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
						<Button compact >{ translate( 'Edit' ) }</Button>
					</ListItemField>
				</ListItem>
			);
		}

		const onEditClick = () => ( actions.openShippingZoneMethod( method.id ) );
		const onEnabledToggle = () => ( actions.toggleShippingZoneMethodEnabled( method.id, ! method.enabled ) );

		return (
			<ListItem key={ index } className="shipping-zone__method" >
				<ListItemField className="shipping-zone__method-title">
					{ method.title }
				</ListItemField>
				<ListItemField className="shipping-zone__method-summary">
					{ getMethodSummary( method, currency ) }
				</ListItemField>
				<ListItemField className="shipping-zone__enable-container">
					<span>
						{ translate( 'Enabled {{toggle/}}', {
							components: {
								toggle: <FormToggle checked={ method.enabled } onChange={ onEnabledToggle } />
							}
						} ) }
					</span>
				</ListItemField>
				<ListItemField className="shipping-zone__method-actions">
					<Button compact onClick={ onEditClick }>{ translate( 'Edit' ) }</Button>
				</ListItemField>
			</ListItem>
		);
	};

	const onAddMethod = () => {
		if ( ! loaded ) {
			return;
		}
		onChange();

		const newType = newMethodTypeOptions[ 0 ];
		actions.addMethodToShippingZone( newType, methodNamesMap( newType ) );
	};

	const methodsToRender = loaded ? methods : [ {}, {}, {} ];

	return (
		<div className="shipping-zone__methods-container">
			<ExtendedHeader
				label={ translate( 'Shipping methods' ) }
				description={ translate( 'Any customers that reside in the locations' +
					' defined above will have access to these shipping methods' ) } >
				<Button onClick={ onAddMethod } disabled={ ! loaded } >{ translate( 'Add method' ) }</Button>
			</ExtendedHeader>
			<List>
				<ListHeader>
					<ListItemField className="shipping-zone__methods-column-title">
						{ translate( 'Method' ) }
					</ListItemField>
					<ListItemField className="shipping-zone__methods-column-summary">
						{ translate( 'Details' ) }
					</ListItemField>
				</ListHeader>
				{ methodsToRender.map( renderMethod ) }
			</List>
			<ShippingZoneMethodDialog siteId={ siteId } onChange={ onChange } />
		</div>
	);
};

ShippingZoneMethodList.propTypes = {
	siteId: PropTypes.number,
	onChange: PropTypes.func.isRequired,
	loaded: PropTypes.bool.isRequired,
};

export default connect(
	( state ) => ( {
		methods: getCurrentlyEditingShippingZoneMethods( state ),
		methodNamesMap: getShippingMethodNameMap( state ),
		newMethodTypeOptions: getNewMethodTypeOptions( state ),
		currency: getCurrencyWithEdits( state ),
	} ),
	( dispatch, ownProps ) => ( {
		actions: bindActionCreatorsWithSiteId( {
			openShippingZoneMethod,
			addMethodToShippingZone,
			toggleShippingZoneMethodEnabled,
		}, dispatch, ownProps.siteId )
	} )
)( localize( ShippingZoneMethodList ) );
