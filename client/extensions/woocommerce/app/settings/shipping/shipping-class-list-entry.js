/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	isShippingClassBeingSaved,
	isShippingClassBeingDeleted,
} from 'woocommerce/state/ui/shipping/classes/selectors';
import { editShippingClass } from 'woocommerce/state/ui/shipping/classes/actions';
import Button from 'components/button';

const ShippingClassEntry = ( {
	name,
	slug,
	description,
	loaded,
	saving,
	deleting,
	translate,
	edit,
} ) => {
	const cssClasses = [ 'shipping__classes-row' ];

	if ( saving || deleting ) {
		cssClasses.push( 'shipping__classes-row-loading' );
	} else if ( ! loaded ) {
		cssClasses.push( 'is-placeholder' );
	}

	const placeholderOrText = text => {
		return text && text.length ? (
			text
		) : (
			<span className="shipping__zones-row-placeholder">&nbsp;</span>
		);
	};

	return (
		<div className={ cssClasses.join( ' ' ) }>
			<div className="shipping__classes-row-icon">
				<Gridicon icon="tag" size={ 24 } />
			</div>
			<div className="shipping__classes-row-class">
				<p className="shipping__zones-row-location-name">
					{ saving ? placeholderOrText( name ) : name }
				</p>
			</div>
			<div className="shipping__classes-row-slug">
				<p className="shipping__zones-row-location-name">
					{ saving ? placeholderOrText( slug ) : slug }
				</p>
			</div>
			<div className="shipping__classes-row-description">
				<p className="shipping__zones-row-method-description">
					{ saving ? placeholderOrText( description ) : description }
				</p>
			</div>
			<div className="shipping__classes-row-actions">
				<Button compact onClick={ edit } key="edit">
					{ translate( 'Edit' ) }
				</Button>
			</div>
		</div>
	);
};

ShippingClassEntry.propTypes = {
	loaded: PropTypes.bool.isRequired,
	name: PropTypes.string,
	slug: PropTypes.string,
	description: PropTypes.string,
};

export default connect(
	( state, { id, siteId } ) => ( {
		saving: isShippingClassBeingSaved( state, id, siteId ),
		deleting: isShippingClassBeingDeleted( state, id, siteId ),
	} ),
	( dispatch, { siteId, id } ) => ( {
		edit: () => dispatch( editShippingClass( siteId, id ) ),
	} )
)( localize( ShippingClassEntry ) );
