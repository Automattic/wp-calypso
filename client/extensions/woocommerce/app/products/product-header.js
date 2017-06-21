/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';

const ProductHeader = ( { onTrash, onSave, isBusy, translate } ) => {
	const trashButton = onTrash &&
		<Button borderless onClick={ onTrash }><Gridicon icon="trash" /></Button>;

	const saveExists = 'undefined' !== typeof onSave;
	const saveDisabled = false === onSave;

	const saveButton = saveExists &&
		<Button primary onClick={ onSave } disabled={ saveDisabled } busy={ isBusy }>
			{ translate( 'Save' ) }
		</Button>;

	return (
		<ActionHeader>
			{ trashButton }
			{ saveButton }
		</ActionHeader>
	);
};

ProductHeader.propTypes = {
	onTrash: PropTypes.func,
	onSave: PropTypes.oneOfType( [
		React.PropTypes.func,
		React.PropTypes.bool,
	] ),
};

export default localize( ProductHeader );
