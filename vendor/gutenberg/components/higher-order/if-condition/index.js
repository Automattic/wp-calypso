/**
 * WordPress dependencies
 */
import { createHigherOrderComponent } from '@wordpress/element';

/**
 * Higher-order component creator, creating a new component which renders if
 * the given condition is satisfied or with the given optional prop name.
 *
 * @param {Function} predicate Function to test condition.
 *
 * @return {Function} Higher-order component.
 */
const ifCondition = ( predicate ) => createHigherOrderComponent(
	( WrappedComponent ) => ( props ) => {
		if ( ! predicate( props ) ) {
			return null;
		}

		return <WrappedComponent { ...props } />;
	},
	'ifCondition'
);

export default ifCondition;
