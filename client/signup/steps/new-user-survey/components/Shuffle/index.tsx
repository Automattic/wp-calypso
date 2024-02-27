import React, { Children, ReactNode, isValidElement, useEffect } from 'react';

export const getCheckBoxKey = ( child: ReactNode ): string => {
	if ( ! isValidElement( child ) || ! child.props.children ) {
		return '';
	}
	const shuffledChildren = Children.toArray( child.props.children );
	const [ checkboxNode ] = shuffledChildren;

	if ( isValidElement( checkboxNode ) && checkboxNode.props.name ) {
		return checkboxNode.props.name;
	}
	return '';
};

type ShuffleProps = {
	/**
	 * An array of ReactNode elements, representing the children to be shuffled.
	 */
	children: Array< ReactNode >;

	/**
	 * An array of strings or null, indicating the current order of children.
	 * If null, the children will be shuffled initially.
	 */
	childOrder: string[] | null;

	/**
	 * A state setter function responsible for updating the child order.
	 * @param {string[] | null} value - The new child order or null to shuffle the children.
	 */
	setChildOrder: React.Dispatch< React.SetStateAction< string[] | null > >;

	/**
	 * A function that extracts a unique key from each child element, used for maintaining consistent order.
	 * @param {ReactNode} child - The child element for which the key is to be extracted.
	 * @returns {string} The key extracted from the child element.
	 */
	getChildKey: ( child: ReactNode ) => string;

	/**
	 * A boolean indicating whether the Shuffling of elements is active is active.
	 */
	isActive?: boolean;
};
/**
 * A controlled component which shuffles children by random order based on provided keys.
 * It ensures the order of children remains consistent when specified keys are provided.
 * @param {ShuffleProps} props - The props for the Shuffle component.
 * @returns {ReactNode} The shuffled children.
 */
const Shuffle = ( props: ShuffleProps ) => {
	const { children, setChildOrder, childOrder, getChildKey, isActive } = props;

	useEffect( () => {
		if ( isActive ) {
			setChildOrder( ( prevChildOrder ) => {
				// If the previous child order is null, shuffle the children based on provided keys
				if ( prevChildOrder === null || prevChildOrder.length !== Children.count( children ) ) {
					const newChildOrder = Children.toArray( children ).map( ( child ) => {
						return getChildKey( child );
					} );
					newChildOrder.sort( () => Math.random() - Math.random() );
					return newChildOrder;
				}
				// If the previous child order exists, maintain it
				return prevChildOrder;
			} );
		}
	}, [ children, setChildOrder, getChildKey, isActive ] );

	// If a child order exists, sort the children based on that order
	let sortedChildrenClone = children;
	if ( isActive && childOrder !== null ) {
		sortedChildrenClone = [ ...children ];
		sortedChildrenClone.sort( ( child1, child2 ) => {
			return (
				childOrder.indexOf( getChildKey( child1 ) ) - childOrder.indexOf( getChildKey( child2 ) )
			);
		} );

		sortedChildrenClone =
			sortedChildrenClone.map( ( child, i ) => {
				if ( isValidElement( child ) ) {
					return React.cloneElement< any >( child, { ...child.props, 'data-testid': i + 1 } );
				}
				return child;
			} ) ?? [];
	}
	return sortedChildrenClone;
};

export default Shuffle;
