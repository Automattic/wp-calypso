/** @format */

/**
 * External dependencies
 */

import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */

import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingClassEntry from './shipping-class-list-entry';
import ShippingClassDialog from './shipping-class-dialog';

import QueryShippingClasses from 'woocommerce/components/query-shipping-classes';
import {
	areShippingClassesLoaded,
	areShippingClassesLoading,
} from 'woocommerce/state/sites/shipping-classes/selectors';
import { getUiShippingClasses } from 'woocommerce/state/ui/shipping/classes/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { addShippingClass } from 'woocommerce/state/ui/shipping/classes/actions';

/**
 * Renders the box for shipping class management.
 */
class ShippingClassesList extends Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
	};

	render() {
		const { siteId, loaded, loading, translate } = this.props;

		return (
			<Fragment>
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

				{ loading || loaded ? this.renderContent() : this.renderConnectionError() }

				<ShippingClassDialog siteId={ siteId } />
			</Fragment>
		);
	}

	/**
	 * Renders the list with shipping classes when there is no connection error.
	 *
	 * @return {Component|null} Either a component when there are shipping classes or null.
	 */
	renderContent = () => {
		const { loaded, shippingClasses, translate } = this.props;

		const classesToRender = loaded ? shippingClasses : [ {}, {}, {} ];

		if ( 0 === classesToRender.length ) {
			return null;
		}

		return (
			<Card className="shipping__classes">
				<div className="shipping__classes-row shipping__classes-header">
					<div className="shipping__classes-cell shipping__classes-icon" />
					<div className="shipping__classes-cell shipping__classes-name">
						{ translate( 'Shipping Class' ) }
					</div>
					<div className="shipping__classes-cell shipping__classes-slug">
						{ translate( 'Slug' ) }
					</div>
					<div className="shipping__classes-cell shipping__classes-description">
						{ translate( 'Description' ) }
					</div>
					<div className="shipping__classes-cell shipping__classes-actions" />
				</div>

				{ classesToRender.map( this.renderShippingClass ) }
			</Card>
		);
	};

	/**
	 * Renders the row for a shipping class.
	 *
	 * @param  {Object} shippingClass The data of the shipping class.
	 * @param  {number} index         The index/key of the current row.
	 * @return {ShippingClassEntry}   The entry for the shipping class row.
	 */
	renderShippingClass = ( shippingClass, index ) => {
		const { siteId, loaded } = this.props;

		return (
			<ShippingClassEntry key={ index } siteId={ siteId } loaded={ loaded } { ...shippingClass } />
		);
	};

	/**
	 * Renders a message that the classes could not be loaded.
	 *
	 * @return {Card} The React component for the error message.
	 */
	renderConnectionError() {
		const { translate } = this.props;

		return (
			<Card className="shipping__classes">
				<p>{ translate( 'Shipping classes could not be loaded.' ) }</p>
			</Card>
		);
	}

	/**
	 * Handles the click of the "Add New" button.
	 *
	 * @param {Event} event The abstraction of the event that just occured.
	 */
	onAddNewClick = event => {
		const { loaded, siteId } = this.props;

		event.preventDefault();

		if ( loaded ) {
			this.props.addShippingClass( siteId );
		}
	};

	/**
	 * Checks for changes every time the component is updated and eventually
	 * triggers the onChange callback of the shipping settings.
	 *
	 * @param {Object} prevProps The props of the component before it was updated.
	 */
	componentDidUpdate( prevProps ) {
		const { onChange } = this.props;

		// Only check for changes if the classes have already been loaded
		if ( ! prevProps.loaded ) {
			return;
		}

		// Compare the classes
		if ( ! isEqual( prevProps.shippingClasses, this.props.shippingClasses ) ) {
			onChange();
		}
	}
}

export default connect(
	state => ( {
		siteId: getSelectedSiteId( state ),
		shippingClasses: getUiShippingClasses( state ),
		loaded: areShippingClassesLoaded( state ),
		loading: areShippingClassesLoading( state ),
	} ),
	dispatch => bindActionCreators( { addShippingClass }, dispatch )
)( localize( ShippingClassesList ) );
