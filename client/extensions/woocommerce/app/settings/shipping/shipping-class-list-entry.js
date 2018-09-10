/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */

import { editShippingClass } from 'woocommerce/state/ui/shipping/classes/actions';
import Button from 'components/button';

const ShippingClassEntry = ( { name, slug, description, loaded, translate, edit } ) => {
	return (
		<div className={ classNames( 'shipping__classes-row', ! loaded && 'is-placeholder' ) }>
			<div className="shipping__classes-cell shipping__classes-icon">
				<Gridicon icon="tag" size={ 24 } />
			</div>
			<div className="shipping__classes-cell shipping__classes-name">
				<p>{ name }</p>
			</div>
			<div className="shipping__classes-cell shipping__classes-slug">
				<p>{ slug }</p>
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
};

export default connect(
	null,
	( dispatch, { siteId, id } ) => ( {
		edit: () => dispatch( editShippingClass( siteId, id ) ),
	} )
)( localize( ShippingClassEntry ) );
