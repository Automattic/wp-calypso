/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';
import { isObject, noop } from 'lodash';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { getLink } from 'woocommerce/lib/nav-utils';

function renderTrashButton( onTrash, isBusy, label ) {
	return (
		onTrash && (
			<Button borderless scary onClick={ onTrash }>
				<Gridicon icon="trash" />
				<span>{ label }</span>
			</Button>
		)
	);
}

function renderSaveButton( onSave, isBusy, label ) {
	if ( 'undefined' === typeof onSave ) {
		// 'Save' not allowed here.
		return null;
	}

	const saveDisabled = false === onSave;

	return (
		<Button primary onClick={ onSave || noop } disabled={ saveDisabled } busy={ isBusy }>
			{ label }
		</Button>
	);
}

const PromotionHeader = ( { promotion, onSave, onTrash, isBusy, translate, site } ) => {
	const existing = promotion && ! isObject( promotion.id );
	const trashButton = renderTrashButton( onTrash, isBusy, translate( 'Delete' ) );
	const saveLabel = existing ? translate( 'Update' ) : translate( 'Save & publish' );
	const saveButton = renderSaveButton( onSave, isBusy, saveLabel );

	const currentCrumb = existing ? (
		<span>{ translate( 'Edit promotion' ) }</span>
	) : (
		<span>{ translate( 'Add promotion' ) }</span>
	);

	const breadcrumbs = [
		<a href={ getLink( '/store/promotions/:site/', site ) }>{ translate( 'Promotions' ) }</a>,
		currentCrumb,
	];

	return (
		<ActionHeader breadcrumbs={ breadcrumbs } primaryLabel={ saveLabel }>
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
		id: PropTypes.oneOfType( [ PropTypes.string, PropTypes.object ] ),
	} ),
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [ PropTypes.func, PropTypes.bool ] ),
};

export default localize( PromotionHeader );
