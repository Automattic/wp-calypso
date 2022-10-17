import classnames from 'classnames';
import React from 'react';
import HorizontalBarListItem from './horizontal-bar-grid-item';

import './style.scss';

const BASE_CLASS_NAME = 'horizontalbarlist';

const HorizontalBarList = ( {
	className,
	data,
	referenceValue,
	// leftActions,
	// middleActions,
	// hasIndicator,
	// onClick,
} ) => {
	if ( ! data || ! data.length ) {
		return <div>No data</div>;
	}

	const baseClass = classnames( className, BASE_CLASS_NAME );
	const barReferenceValue = referenceValue ? referenceValue : data[ 0 ]?.value;

	return (
		<ul className={ baseClass }>
			{ data.map( ( item ) => {
				return <HorizontalBarListItem data={ item } referenceValue={ barReferenceValue } />;
			} ) }
		</ul>
	);
};

export default HorizontalBarList;
