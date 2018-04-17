/** @format */

/**
 * External dependencies
 */
import { isEqual, sortBy } from 'lodash';

const NUM_COLOR_SECTIONS = 3;

const assignSectionFunc = ( datum, index ) => {
	return {
		...datum,
		sectionNum: index % NUM_COLOR_SECTIONS,
	};
};

const sortDataAndAssignSections = data => {
	return sortBy( data, datum => datum.value )
		.reverse()
		.map( assignSectionFunc );
};

const isDataEqual = ( currentData, newData ) => {
	return isEqual( currentData, newData );
};

export { sortDataAndAssignSections, isDataEqual };
