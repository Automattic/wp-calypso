/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gridicon from 'components/gridicon';

/**
 * Module variables
 */
const noop = () => {};

export default function PlanFeaturesItem( {
	children,
	description,
	onClick = noop,
	onMouseEnter = noop,
	onMouseLeave = noop,
	onTouchStart = noop,
} ) {
	const handleOnClick = ( { currentTarget } ) => {
		onClick( currentTarget, description );
	};

	const handleOnTouchStart = ( { currentTarget } ) => {
		onTouchStart( currentTarget, description );
	};

	const handleOnMouseEvent = ( { currentTarget } ) => {
		onMouseEnter( currentTarget, description );
	};

	const handleOnMouseLeave = ( { currentTarget } ) => {
		onMouseLeave( currentTarget, description );
	};

	return (
		<div className="plan-features__item">
			<Gridicon
				className="plan-features__item-checkmark"
				size={ 18 } icon="checkmark" />
			{ children }
			<span
				onMouseEnter={ handleOnMouseEvent }
				onMouseLeave={ handleOnMouseLeave }
				onTouchStart={ handleOnTouchStart }
				onClick={ handleOnClick }
				className="plan-features__item-tip-info"
			>
				<Gridicon icon="info-outline" size={ 18 } />
			</span>
		</div>
	);
}
