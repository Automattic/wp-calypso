/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { isObject } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProductHeader = ( { onView, onTrash, onSave, isBusy, translate, site, product } ) => {
	const existing = product && ! isObject( product.id );

	const viewButton = onView &&
		<Button borderless onClick={ onView }><Gridicon icon="visible" /> { translate( 'View' ) } </Button>;

	const trashButton = onTrash &&
		<Button borderless scary onClick={ onTrash }><Gridicon icon="trash" /> { translate( 'Trash' ) } </Button>;

	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveLabel = ( product && existing ? translate( 'Update' ) : translate( 'Save & Publish' ) );

	const saveButton = saveExists &&
		<Button primary onClick={ onSave } disabled={ saveDisabled } busy={ isBusy }> { saveLabel } </Button>;

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
	onView: PropTypes.func,
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [
		React.PropTypes.func,
		React.PropTypes.bool,
	] ),
};

export default localize( ProductHeader );
