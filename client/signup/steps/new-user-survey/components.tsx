import { Card, FormLabel } from '@automattic/components';
import styled from '@emotion/styled';
import { Children, ReactNode, isValidElement, useEffect } from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';

export type Viewport = 'desktop' | 'mobile' | 'tablet';
type PropsWithViewport = { currentViewport: Viewport };
export const SurveyFormContainer = styled.div`
	margin: 0
		${ ( { currentViewport }: PropsWithViewport ) =>
			currentViewport === 'desktop' ? 'auto' : '10px' };
`;

export const StyledCard = styled( Card )`
	margin: 0 auto;
	padding: 25px 30px;
	display: flex;
	justify-content: center;
	width: ${ ( props: PropsWithViewport ) =>
		props.currentViewport === 'mobile' ? '100%' : 'fit-content' };
	min-width: ${ ( props: PropsWithViewport ) =>
		props.currentViewport === 'mobile' ? 'unset' : '459px' };
	&&&&& {
		margin-bottom: 15px;
	}
`;

export const StyledLabel = styled( FormLabel )`
	&.form-label.form-label {
		min-height: 32px;
		display: flex;
		align-items: center;
	}
`;

export const StyledFormTextInput = styled< any >( FormTextInput )`
	&.form-text-input.form-text-input {
		margin-left: 24px;
		max-width: 385px;
		font-size: 100%;
	}
`;

export const CardContent = styled.div`
	width: 100%;
`;

export const OptionsContainer = styled.div`
	padding: 0 20px;
`;

export const ButtonContainer = styled.div`
	text-align: center;
	padding-bottom: 10px;
	padding-top: 10px;
`;

export const getCheckboxKey = ( child: ReactNode ): string => {
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
};
/**
 * A controlled component which shuffles children by random order based on provided keys.
 * It ensures the order of children remains consistent when specified keys are provided.
 * @param {ShuffleProps} props - The props for the Shuffle component.
 * @returns {ReactNode} The shuffled children.
 */
export const Shuffle = ( props: ShuffleProps ) => {
	const { children, setChildOrder, childOrder, getChildKey } = props;

	useEffect( () => {
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
	}, [ children, setChildOrder, getChildKey ] );

	// If a child order exists, sort the children based on that order
	let sortedChildrenClone = children;
	if ( childOrder !== null ) {
		sortedChildrenClone = [ ...children ];
		sortedChildrenClone.sort( ( child1, child2 ) => {
			return (
				childOrder.indexOf( getChildKey( child1 ) ) - childOrder.indexOf( getChildKey( child2 ) )
			);
		} );
	}
	return sortedChildrenClone;
};
