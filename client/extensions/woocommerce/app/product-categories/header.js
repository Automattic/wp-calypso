/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { isObject } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';

function renderTrashButton( onTrash, category, translate ) {
	return (
		onTrash && (
			<Button borderless scary onClick={ onTrash ? onTrash : undefined }>
				<Gridicon icon="trash" />
				<span>{ translate( 'Delete' ) } </span>
			</Button>
		)
	);
}

function renderSaveButton( onSave, isBusy, category, translate ) {
	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveLabel =
		category && ! isObject( category.id ) ? translate( 'Update' ) : translate( 'Save' );

	return (
		saveExists && (
			<Button
				primary
				onClick={ onSave ? onSave : undefined }
				disabled={ saveDisabled }
				busy={ isBusy }
			>
				{ saveLabel }
			</Button>
		)
	);
}

const ProductCategoryHeader = ( { onTrash, onSave, translate, site, category, isBusy } ) => {
	const existing = category && ! isObject( category.id );

	const trashButton = renderTrashButton( onTrash, category, translate );
	const saveButton = renderSaveButton( onSave, isBusy, category, translate );

	const currentCrumb =
		category && existing ? (
			<span>{ translate( 'Edit Product Category' ) }</span>
		) : (
			<span>{ translate( 'Add New' ) }</span>
		);

	const breadcrumbs = [
		<a href={ getLink( '/store/products/:site/', site ) }> { translate( 'Products' ) } </a>,
		<a href={ getLink( '/store/products/categories/:site/', site ) }>
			{' '}
			{ translate( 'Categories' ) }{' '}
		</a>,
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs }>
			{ trashButton }
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
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [ PropTypes.func, PropTypes.bool ] ),
};

export default localize( ProductCategoryHeader );
