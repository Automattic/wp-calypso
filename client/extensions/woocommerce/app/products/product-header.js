/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import { isObject } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import ActionHeader from 'woocommerce/components/action-header';
import { getLink } from 'woocommerce/lib/nav-utils';

function renderViewButton( product, translate ) {
	const url = product && product.permalink;
	return (
		// TODO: Do more to validate this URL?
		<Button borderless className="products__header-view-link" href={ url } target="_blank" rel="noopener noreferrer">
			<Gridicon icon="visible" />
			<span>{ translate( 'View' ) }</span>
		</Button>
	);
}

function renderTrashButton( onTrash, product, isBusy, translate ) {
	return onTrash && (
		<Button borderless scary onClick={ onTrash }>
			<Gridicon icon="trash" />
			<span>{ translate( 'Delete' ) } </span>
		</Button>
	);
}

function renderSaveButton( onSave, product, isBusy, translate ) {
	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveLabel = ( product && ! isObject( product.id )
		? translate( 'Update' )
		: translate( 'Save & Publish' )
	);

	return saveExists && (
		<Button primary onClick={ onSave } disabled={ saveDisabled } busy={ isBusy }>
			{ saveLabel }
		</Button>
	);
}

const ProductHeader = ( { viewEnabled, onTrash, onSave, isBusy, translate, site, product } ) => {
	const existing = product && ! isObject( product.id );

	const viewButton = viewEnabled && renderViewButton( product, translate );
	const trashButton = renderTrashButton( onTrash, product, isBusy, translate );
	const saveButton = renderSaveButton( onSave, product, isBusy, translate );

	const currentCrumb = product && existing
		? ( <span>{ translate( 'Edit Product' ) }</span> )
		: ( <span>{ translate( 'Add New' ) }</span> );

	const breadcrumbs = [
		( <a href={ getLink( '/store/products/:site/', site ) }> { translate( 'Products' ) } </a> ),
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs }>
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
		id: PropTypes.oneOfType( [
			PropTypes.number,
			PropTypes.object,
		] ),
	} ),
	viewEnabled: PropTypes.bool,
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [
		PropTypes.func,
		PropTypes.bool,
	] ),
};

export default localize( ProductHeader );
