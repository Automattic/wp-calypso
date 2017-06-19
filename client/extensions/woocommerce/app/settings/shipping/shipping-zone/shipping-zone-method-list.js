/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ExtendedHeader from 'woocommerce/components/extended-header';
import List from 'woocommerce/components/list/list';
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';
import ShippingZoneMethodDialog from './shipping-zone-method-dialog';
import Spinner from 'components/spinner';
import { getMethodSummary } from 'woocommerce/state/ui/shipping/zones/methods/utils';
import {
	openShippingZoneMethod,
	addMethodToShippingZone
} from 'woocommerce/state/ui/shipping/zones/methods/actions';
import {
	getCurrentlyEditingShippingZoneMethods,
	getNewMethodTypeOptions,
} from 'woocommerce/state/ui/shipping/zones/methods/selectors';

const ShippingZoneMethodList = ( { siteId, loaded, methods, newMethodTypeOptions, translate, onChange, actions } ) => {
	const renderMethod = ( method, index ) => {
		const onEditClick = () => ( actions.openShippingZoneMethod( siteId, method.id ) );

		return (
			<ListItem key={ index } >
				<ListItemField>
					<span className="shipping-zone__method-title">{ method.title }</span>
					<span className="shipping-zone__method-summary">{ getMethodSummary( method ) }</span>
				</ListItemField>
				<ListItemField>
					<Button compact onClick={ onEditClick }>{ translate( 'Edit' ) }</Button>
				</ListItemField>
			</ListItem>
		);
	};

	const renderContent = () => {
		if ( ! loaded ) {
			return (
				<div className="shipping-zone__loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		const onAddMethod = () => {
			onChange();
			actions.addMethodToShippingZone( siteId, newMethodTypeOptions[ 0 ] );
		};

		return [
			...methods.map( renderMethod ),
			<ListItem key={ methods.length }>
				<ListItemField>
					<Button onClick={ onAddMethod }>{ translate( 'Add method' ) }</Button>
				</ListItemField>
			</ListItem>
		];
	};

	return (
		<div className="shipping-zone__methods-container">
			<ExtendedHeader
				label={ translate( 'Shipping methods' ) }
				description={ translate( 'Any customers that reside in the locations' +
					' defined above will have access to these shipping methods' ) } />
			<List>
				{ renderContent() }
			</List>
			<ShippingZoneMethodDialog siteId={ siteId } onChange={ onChange } />
		</div>
	);
};

ShippingZoneMethodList.propTypes = {
	siteId: PropTypes.number,
	onChange: PropTypes.func.isRequired,
};

export default connect(
	( state ) => ( {
		methods: getCurrentlyEditingShippingZoneMethods( state ),
		newMethodTypeOptions: getNewMethodTypeOptions( state ),
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators( {
			openShippingZoneMethod,
			addMethodToShippingZone,
		}, dispatch )
	} )
)( localize( ShippingZoneMethodList ) );
