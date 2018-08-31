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

import { editShippingClass } from 'woocommerce/state/ui/shipping/classes/actions';
import Button from 'components/button';

const ShippingClassEntry = ( { name, slug, description, loaded, translate, edit, isNew } ) => {
	const cssClasses = [ 'shipping__classes-row' ];

	if ( ! loaded ) {
		cssClasses.push( 'is-placeholder' );
	}

	// Indicates that the displayed value is not final
	const placeholderOrText = text => {
		if ( ! isNew ) {
			return text;
		}

		return text && text.length ? (
			text
		) : (
			<span className="shipping__classes-placeholder">&nbsp;</span>
		);
	};

	return (
		<div className={ cssClasses.join( ' ' ) }>
			<div className="shipping__classes-cell shipping__classes-icon">
				<Gridicon icon="tag" size={ 24 } />
			</div>
			<div className="shipping__classes-cell shipping__classes-name">
				<p>{ name }</p>
			</div>
			<div className="shipping__classes-cell shipping__classes-slug">
				<p>{ placeholderOrText( slug ) }</p>
			</div>
			<div className="shipping__classes-cell shipping__classes-description">
				<p>{ description }</p>
			</div>
			<div className="shipping__classes-cell shipping__classes-actions">
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
	isNew: PropTypes.bool,
};

export default connect(
	null,
	( dispatch, { siteId, id } ) => ( {
		edit: () => dispatch( editShippingClass( siteId, id ) ),
	} )
)( localize( ShippingClassEntry ) );
