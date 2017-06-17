/**
 * External dependencies
 */
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingZoneEntry from './shipping-zone-list-entry';
import Spinner from 'components/spinner';
import { fetchShippingZones } from 'woocommerce/state/sites/shipping-zones/actions';
import { areShippingZonesLoaded } from 'woocommerce/state/sites/shipping-zones/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getShippingZones } from 'woocommerce/state/ui/shipping/zones/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

class ShippingZoneList extends Component {
	componentWillMount() {
		if ( this.props.siteId ) {
			this.props.actions.fetchShippingZones( this.props.siteId );
		}
	}

	componentWillReceiveProps( { siteId } ) {
		if ( siteId === this.props.siteId ) {
			return;
		}

		this.props.actions.fetchShippingZones( siteId );
	}

	renderContent() {
		if ( ! this.props.loaded ) {
			return (
				<div className="shipping__loading-spinner">
					<Spinner size={ 24 } />
				</div>
			);
		}

		const { translate, siteId } = this.props;

		const renderShippingZone = ( zone, index ) => {
			return ( <ShippingZoneEntry key={ index } siteId={ siteId } { ...zone } /> );
		};

		return (
			<div>
				<div className="shipping__zones-row shipping__zones-header">
					<div className="shipping__zones-row-icon"></div>
					<div className="shipping__zones-row-location">{ translate( 'Location' ) }</div>
					<div className="shipping__zones-row-methods">{ translate( 'Shipping methods' ) }</div>
					<div className="shipping__zones-row-actions" />
				</div>
				{ this.props.shippingZones.map( renderShippingZone ) }
			</div>
		);
	}

	render() {
		const { site, loaded, translate } = this.props;

		const addNewHref = loaded
			? getLink( '/store/settings/shipping/:site/zone/new', site )
			: '#';

		const onAddNewClick = ( event ) => {
			if ( ! loaded ) {
				event.preventDefault();
			}
		};

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Shipping Zones' ) }
					description={ translate( 'The regions you ship to and the methods you will provide.' ) }>
					<Button
						href={ addNewHref }
						onClick={ onAddNewClick }
						disabled={ ! loaded }>{
							translate( 'Add zone' ) }
					</Button>
				</ExtendedHeader>
				<Card className="shipping__zones">
					{ this.renderContent() }
				</Card>
			</div>
		);
	}
}

export default connect(
	( state ) => ( {
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
		shippingZones: getShippingZones( state ),
		loaded: areShippingZonesLoaded( state )
	} ),
	( dispatch ) => ( {
		actions: bindActionCreators( {
			fetchShippingZones
		}, dispatch )
	} )
)( localize( ShippingZoneList ) );
