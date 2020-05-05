/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getMethodSummary } from './shipping-zone/shipping-methods/utils';
import { getSelectedSite } from 'state/ui/selectors';
import { getShippingZoneMethods } from 'woocommerce/state/ui/shipping/zones/methods/selectors';
import { getCurrencyWithEdits } from 'woocommerce/state/ui/payments/currency/selectors';

const ShippingZoneEntry = ( { translate, id, name, methods, currency, loaded, isValid, site } ) => {
	if ( ! loaded ) {
		return (
			<div className="shipping__zones-row is-placeholder">
				<div className="shipping__zones-row-icon">
					<Gridicon icon="globe" size={ 24 } />
				</div>
				<div className="shipping__zones-row-location">
					<p className="shipping__zones-row-location-name" />
					<p className="shipping__zones-row-location-description" />
				</div>
				<div className="shipping__zones-row-methods">
					<div className="shipping__zones-row-method">
						<p className="shipping__zones-row-method-name" />
						<p className="shipping__zones-row-method-description" />
					</div>
					<div className="shipping__zones-row-method">
						<p className="shipping__zones-row-method-name" />
						<p className="shipping__zones-row-method-description" />
					</div>
				</div>
				<div className="shipping__zones-row-actions">
					<Button compact>{ translate( 'Edit' ) }</Button>
				</div>
			</div>
		);
	}

	const renderMethodCell = ( title, summary = '', key = 0 ) => {
		return (
			<div key={ key } className="shipping__zones-row-method">
				<p className="shipping__zones-row-method-name">{ title }</p>
				<p className="shipping__zones-row-method-description">{ summary }</p>
			</div>
		);
	};

	const renderMethod = ( methodKey ) => {
		const method = methods[ methodKey ];
		let summary = getMethodSummary( method, currency );
		if ( ! method.enabled ) {
			summary = translate( '%(summary)s - Disabled', {
				args: { summary },
				comment: 'Summary of a disabled shipping method in WooCommerce',
			} );
		}
		return renderMethodCell( method.title, summary, methodKey );
	};

	const icon = 0 === id ? 'globe' : 'location';

	const onEditClick = ( event ) => {
		if ( ! isValid ) {
			event.preventDefault();
		}
	};

	return (
		<div className="shipping__zones-row">
			<div className="shipping__zones-row-icon">
				<Gridicon icon={ icon } size={ 24 } />
			</div>
			<div className="shipping__zones-row-location">
				<p className="shipping__zones-row-location-name">{ name }</p>
				{ /*<p className="shipping__zones-row-location-description">{ locationDescription }</p>*/ }
			</div>
			<div className="shipping__zones-row-methods">
				{ methods && methods.length
					? Object.keys( methods ).map( renderMethod )
					: renderMethodCell( translate( 'No shipping methods' ) ) }
			</div>
			<div className="shipping__zones-row-actions">
				<Button
					compact
					href={ getLink( `/store/settings/shipping/zone/:site/${ id }`, site ) }
					disabled={ ! isValid }
					onClick={ onEditClick }
				>
					{ translate( 'Edit' ) }
				</Button>
			</div>
		</div>
	);
};

ShippingZoneEntry.propTypes = {
	id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	name: PropTypes.string,
	loaded: PropTypes.bool.isRequired,
	isValid: PropTypes.bool.isRequired,
};

export default connect( ( state, ownProps ) => ( {
	site: getSelectedSite( state ),
	methods: ownProps.loaded && getShippingZoneMethods( state, ownProps.id ),
	currency: ownProps.loaded && getCurrencyWithEdits( state ),
} ) )( localize( ShippingZoneEntry ) );
