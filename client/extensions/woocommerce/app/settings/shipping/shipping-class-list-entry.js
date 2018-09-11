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

const ShippingClassEntry = ( { name, slug, description, loaded, disabled, translate, edit } ) => {
	return (
		<div
			className={ classNames(
				'shipping__table-row',
				( ! loaded || disabled ) && 'is-placeholder'
			) }
		>
			<div className="shipping__classes-cell shipping__table-icon">
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
			<div className="shipping__classes-cell shipping__table-actions">
				<Button compact onClick={ edit } key="edit" disabled={ disabled }>
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
	disabled: PropTypes.bool,
};

export default connect(
	null,
	( dispatch, { siteId, id } ) => ( {
		edit: () => dispatch( editShippingClass( siteId, id ) ),
	} )
)( localize( ShippingClassEntry ) );
