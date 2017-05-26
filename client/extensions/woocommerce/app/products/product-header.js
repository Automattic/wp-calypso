/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import ActionHeader from '../../components/action-header';
import Button from 'components/button';

const ProductHeader = ( { onTrash, onSave, translate } ) => {
	const trashButton = onTrash &&
		<Button borderless onClick={ onTrash }><Gridicon icon="trash" /></Button>;

	const saveButton = onSave &&
		<Button primary onClick={ onSave }>{ translate( 'Save' ) }</Button>;

	return (
		<ActionHeader>
			{ trashButton }
			{ saveButton }
		</ActionHeader>
	);
};

ProductHeader.propTypes = {
	onTrash: PropTypes.func,
	onSave: PropTypes.func,
};

export default localize( ProductHeader );

