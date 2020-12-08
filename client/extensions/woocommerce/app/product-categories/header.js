/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { isObject } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';

function renderDeleteButton( onDelete, label ) {
	return (
		onDelete && (
			<Button borderless scary onClick={ onDelete ? onDelete : undefined }>
				<Gridicon icon="trash" />
				<span>{ label } </span>
			</Button>
		)
	);
}

function renderSaveButton( onSave, isBusy, label ) {
	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	return (
		saveExists && (
			<Button
				primary
				onClick={ onSave ? onSave : undefined }
				disabled={ saveDisabled }
				busy={ isBusy }
			>
				{ label }
			</Button>
		)
	);
}

const ProductCategoryHeader = ( { onDelete, onSave, translate, site, category, isBusy } ) => {
	const existing = category && ! isObject( category.id );
	const deleteButton = renderDeleteButton( onDelete, translate( 'Delete' ) );
	const saveLabel = existing ? translate( 'Update' ) : translate( 'Save' );
	const saveButton = renderSaveButton( onSave, isBusy, saveLabel );

	const currentCrumb =
		category && existing ? (
			<span>{ translate( 'Edit Product Category' ) }</span>
		) : (
			<span>{ translate( 'Add New' ) }</span>
		);

	const breadcrumbs = [
		<a href={ getLink( '/store/products/:site/', site ) }> { translate( 'Products' ) } </a>,
		<a href={ getLink( '/store/products/categories/:site/', site ) }>
			{ ' ' }
			{ translate( 'Categories' ) }{ ' ' }
		</a>,
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs } primaryLabel={ saveLabel }>
			{ deleteButton }
			{ saveButton }
		</ActionHeader>
	);
};

ProductCategoryHeader.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	category: PropTypes.shape( {
		id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	} ),
	onDelete: PropTypes.func,
	onSave: PropTypes.oneOfType( [ PropTypes.func, PropTypes.bool ] ),
};

export default localize( ProductCategoryHeader );
