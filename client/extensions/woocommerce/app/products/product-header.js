/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';
import { isNumber } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { getLink } from 'woocommerce/lib/nav-utils';

const ProductHeader = ( { onTrash, onSave, isBusy, translate, site, product } ) => {
	const trashButton = onTrash &&
		<Button borderless onClick={ onTrash }><Gridicon icon="trash" /></Button>;

	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveButton = saveExists &&
		<Button primary onClick={ onSave } disabled={ saveDisabled } busy={ isBusy }>
			{ translate( 'Save' ) }
		</Button>;

	const productsCrumbs = (
		<a href={ getLink( '/store/products/:site/', site ) }>
			{ translate( 'Products' ) }
		</a>
	);

	const breadcrumbs = product && isNumber( product.id )
		? ( <span>{ translate( 'Edit Product' ) }</span> )
		: ( <span>{ translate( 'Add New Product' ) }</span> );

	return (
		<ActionHeader breadcrumbs={ ( <span>{ productsCrumbs } &gt; { breadcrumbs }</span> ) }>
			{ trashButton }
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
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [
		React.PropTypes.func,
		React.PropTypes.bool,
	] ),
};

export default localize( ProductHeader );
