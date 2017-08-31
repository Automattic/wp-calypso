/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { translate as __ } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

const ItemInfo = ( { item, itemIndex, openItemMove } ) => {
	const onMoveClick = () => openItemMove( itemIndex );

	const renderMoveToPackage = () => {
		return (
			<Button className="packages-step__item-move" compact onClick={ onMoveClick }>
				{ __( 'Move' ) }
			</Button>
		);
	};

	return (
		<div key={ itemIndex } className="packages-step__item">
			<div className="packages-step__item-name">
					<span>
						{ item.url
							? <a href={ item.url } target="_blank" rel="noopener noreferrer">{ item.name }</a>
							: item.name
						}
					</span>
				{ item.attributes && <p>{ item.attributes }</p> }
			</div>
			<div>
				{ renderMoveToPackage() }
			</div>
		</div>
	);
};

ItemInfo.propTypes = {
	item: PropTypes.object.isRequired,
	itemIndex: PropTypes.number.isRequired,
	openItemMove: PropTypes.func.isRequired,
};

export default ItemInfo;
