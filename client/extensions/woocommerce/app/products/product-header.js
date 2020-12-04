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

function renderViewButton( product, label ) {
	const url = product && product.permalink;
	return (
		// TODO: Do more to validate this URL?
		<Button
			borderless
			className="products__header-view-link"
			href={ url }
			target="_blank"
			rel="noopener noreferrer"
		>
			<Gridicon icon="visible" />
			<span>{ label }</span>
		</Button>
	);
}

function renderTrashButton( onTrash, isBusy, label ) {
	return (
		onTrash && (
			<Button borderless scary onClick={ onTrash ? onTrash : undefined }>
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

const ProductHeader = ( { viewEnabled, onTrash, onSave, isBusy, translate, site, product } ) => {
	const existing = product && ! isObject( product.id );
	const viewButton = viewEnabled && renderViewButton( product, translate( 'View' ) );
	const trashButton = renderTrashButton( onTrash, isBusy, translate( 'Delete' ) );
	const saveLabel = existing ? translate( 'Update' ) : translate( 'Save & publish' );
	const saveButton = renderSaveButton( onSave, isBusy, saveLabel );

	const currentCrumb =
		product && existing ? (
			<span>{ translate( 'Edit product' ) }</span>
		) : (
			<span>{ translate( 'Add new' ) }</span>
		);

	const breadcrumbs = [
		<a href={ getLink( '/store/products/:site/', site ) }> { translate( 'Products' ) } </a>,
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs } primaryLabel={ saveLabel }>
			{ trashButton }
			{ viewButton }
			{ saveButton }
		</ActionHeader>
	);
};

ProductHeader.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	product: PropTypes.shape( {
		id: PropTypes.oneOfType( [ PropTypes.number, PropTypes.object ] ),
	} ),
	viewEnabled: PropTypes.bool,
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [ PropTypes.func, PropTypes.bool ] ),
};

export default localize( ProductHeader );
