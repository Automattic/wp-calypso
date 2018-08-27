/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingClassEntry from './shipping-class-list-entry';
import ShippingClassDialog from './shipping-class-dialog';

import QueryShippingClasses from 'woocommerce/components/query-shipping-classes';
import { areShippingClassesLoaded } from 'woocommerce/state/sites/shipping-classes/selectors';
import { getUiShippingClasses } from 'woocommerce/state/ui/shipping/classes/selectors';

import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

import { addShippingClass } from 'woocommerce/state/ui/shipping/classes/actions';

/**
 * ToDos:
 * 1. Indicate errors during fetch
 */

class ShippingClassesList extends Component {
	renderContent = () => {
		const { siteId, loaded, shippingClasses, translate } = this.props;

		const renderShippingClass = ( shippingClass, index ) => {
			return (
				<ShippingClassEntry
					key={ index }
					siteId={ siteId }
					loaded={ loaded }
					{ ...shippingClass }
				/>
			);
		};

		const classesToRender = loaded ? shippingClasses : [ {}, {}, {} ];

		return (
			<div>
				<div className="shipping__classes-row shipping__classes-header">
					<div className="shipping__classes-row-icon" />
					<div className="shipping__classes-row-class">{ translate( 'Shipping Class' ) }</div>
					<div className="shipping__classes-row-slug">{ translate( 'Slug' ) }</div>
					<div className="shipping__classes-row-description">{ translate( 'Description' ) }</div>
					<div className="shipping__classes-row-actions" />
				</div>

				{ classesToRender.map( renderShippingClass ) }

				<ShippingClassDialog siteId={ siteId } />
			</div>
		);
	};

	onAddNewClick = event => {
		const { loaded, add, siteId } = this.props;

		event.preventDefault();

		if ( loaded ) {
			add( siteId );
		}
	};

	render() {
		const { siteId, loaded, translate } = this.props;

		return (
			<div>
				<QueryShippingClasses siteId={ siteId } />

				<ExtendedHeader
					label={ translate( 'Shipping Classes' ) }
					description={ translate(
						'Group products of similar type to provide different shipping ' +
							'rates to each shipping class.'
					) }
				>
					<Button href="#" onClick={ this.onAddNewClick } disabled={ ! loaded }>
						{ translate( 'Add class' ) }
					</Button>
				</ExtendedHeader>

				<Card className="shipping__classes">{ this.renderContent() }</Card>
			</div>
		);
	}
}

export default connect(
	state => ( {
		site: getSelectedSite( state ),
		siteId: getSelectedSiteId( state ),
		shippingClasses: getUiShippingClasses( state ),
		loaded: areShippingClassesLoaded( state ),
	} ),
	dispatch =>
		bindActionCreators(
			{
				add: addShippingClass,
			},
			dispatch
		)
)( localize( ShippingClassesList ) );
