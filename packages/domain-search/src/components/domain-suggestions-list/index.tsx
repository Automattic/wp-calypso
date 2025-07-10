import { Card, CardDivider } from '@wordpress/components';
import { createContext, useContext, useMemo, Children, isValidElement, Fragment } from 'react';
import { useContainerQuery } from '../../hooks/use-container-query';

interface DomainSuggestionsListProps {
	children: React.ReactNode;
}

interface DomainSuggestionListContextValue {
	activeQuery: 'small' | 'large';
}

const DomainSuggestionListContext = createContext< DomainSuggestionListContextValue | undefined >(
	undefined
);

export const DomainSuggestionsList = ( { children }: DomainSuggestionsListProps ) => {
	const { ref: containerRef, activeQuery } = useContainerQuery( {
		small: 0,
		large: 480,
	} );

	const contextValue = useMemo( () => ( { activeQuery } ), [ activeQuery ] );

	const childrenWithSeparators = useMemo( () => {
		const totalChildren = Children.count( children );

		return Children.toArray( children ).map( ( child, index ) => {
			if ( ! isValidElement( child ) ) {
				return <Fragment key={ `child-${ index }` }>{ child }</Fragment>;
			}

			return (
				<Fragment key={ `child-${ index }` }>
					{ child }
					{ index < totalChildren - 1 && <CardDivider /> }
				</Fragment>
			);
		} );
	}, [ children ] );

	return (
		<Card ref={ containerRef }>
			<DomainSuggestionListContext.Provider value={ contextValue }>
				{ childrenWithSeparators }
			</DomainSuggestionListContext.Provider>
		</Card>
	);
};

export const useDomainSuggestionsListContext = () => useContext( DomainSuggestionListContext );
