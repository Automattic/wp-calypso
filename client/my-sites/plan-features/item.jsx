/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';
import { abtest } from 'lib/abtest';

export default function PlanFeaturesItem( {
	children,
	description,
	onMouseEnter,
	onMouseLeave,
	onTouchStart,
} ) {
	const handleOnTouchStart = ( event ) => {
		onTouchStart( event.currentTarget, description );
	};

	const handleOnMouseEvent = ( event ) => {
		onMouseEnter( event.currentTarget, description );
	};

	const handleOnMouseLeave = ( event ) => {
		onMouseLeave( event.currentTarget, description );
	};

	const mouseEvents = {
		onMouseEnter: handleOnMouseEvent,
		onMouseLeave: handleOnMouseLeave
	};
	const hoverOnRow = (
		abtest( 'plansDescriptions' ) === 'ascendingPriceEagerDescription' ||
		abtest( 'plansDescriptions' ) === 'descendingPriceEagerDescription'
	);

	return (
		<div className="plan-features__item"
			{ ...( hoverOnRow && mouseEvents ) }
		>
			<Gridicon
				className="plan-features__item-checkmark"
				size={ 18 } icon="checkmark" />
			{ children }
			<span
				{ ...( ! hoverOnRow && mouseEvents ) }
				onTouchStart={ handleOnTouchStart }
				className="plan-features__item-tip-info"
			>
				<Gridicon icon="info-outline" size={ 18 } />
			</span>
		</div>
	);
}
