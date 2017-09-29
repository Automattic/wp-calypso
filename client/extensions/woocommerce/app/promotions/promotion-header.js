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

function renderTrashButton( onTrash, promotion, isBusy, translate ) {
	return onTrash && (
		<Button borderless scary onClick={ onTrash }>
			<Gridicon icon="trash" />
			<span>{ translate( 'Delete' ) }</span>
		</Button>
	);
}

function renderSaveButton( onSave, promotion, isBusy, translate ) {
	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveLabel = ( promotion && ! isObject( promotion.id )
		? translate( 'Update' )
		: translate( 'Save & Publish' )
	);

	return saveExists && (
		<Button primary onClick={ onSave } disabled={ saveDisabled } busy={ isBusy }>
			{ saveLabel }
		</Button>
	);
}

const PromotionHeader = ( { promotion, onSave, onTrash, isBusy, translate, site } ) => {
	const existing = promotion && ! isObject( promotion.id );

	const trashButton = renderTrashButton( onTrash, promotion, isBusy, translate );
	const saveButton = renderSaveButton( onSave, promotion, isBusy, translate );

	const currentCrumb = promotion && existing
		? ( <span>{ translate( 'Edit Promotion' ) }</span> )
		: ( <span>{ translate( 'Add Promotion' ) }</span> );

	const breadcrumbs = [
		( <a href={ getLink( '/store/promotions/:site/', site ) }>{ translate( 'Promotions' ) }</a> ),
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs }>
			{ trashButton }
			{ saveButton }
		</ActionHeader>
	);
};

PromotionHeader.propTypes = {
	site: PropTypes.shape( {
		slug: PropTypes.string,
	} ),
	promotion: PropTypes.shape( {
		id: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.object,
		] ),
	} ),
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [
		PropTypes.func,
		PropTypes.bool,
	] ),
};

export default localize( PromotionHeader );

