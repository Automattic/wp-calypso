/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import StickyPanel from 'components/sticky-panel';

const ProductHeader = ( { onTrash, onDuplicate, onSave, translate } ) => {
	const trashButton = onTrash &&
		<Button borderless onClick={ onTrash }><Gridicon icon="trash" /></Button>;

	const duplicateButton = onDuplicate &&
		<Button onClick={ onDuplicate }>{ translate( 'Duplicate' ) }</Button>;

	const saveButton = onSave &&
		<Button primary onClick={ onSave }>{ translate( 'Save' ) }</Button>;

	return (
		<StickyPanel>
			<Card className="products__header">
				<span>Breadcrumbs > go > here</span>
				<div className="products__header-right">
					{ trashButton }
					{ duplicateButton }
					{ saveButton }
				</div>
			</Card>
		</StickyPanel>
	);
};

ProductHeader.propTypes = {
	onTrash: PropTypes.func,
	onDuplicate: PropTypes.func,
	onSave: PropTypes.func,
};

export default localize( ProductHeader );

