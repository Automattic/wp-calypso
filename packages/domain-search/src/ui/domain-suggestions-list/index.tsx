import { Card, CardDivider } from '@wordpress/components';
import { useMemo, Children, isValidElement, Fragment } from 'react';
import {
	DomainSuggestionContainerContext,
	useDomainSuggestionContainer,
} from '../../hooks/use-domain-suggestion-container';

import './style.scss';

interface DomainSuggestionsListProps {
	children: React.ReactNode;
}

export const DomainSuggestionsList = ( { children }: DomainSuggestionsListProps ) => {
	const { containerRef, activeQuery, currentWidth } = useDomainSuggestionContainer();

	const contextValue = useMemo(
		() => ( { activeQuery, currentWidth } ),
		[ activeQuery, currentWidth ]
	);

	const childrenWithSeparators = useMemo( () => {
		const totalChildren = Children.count( children );

		return Children.toArray( children ).map( ( child, index ) => {
			if ( ! isValidElement( child ) ) {
				return <Fragment key={ `child-${ index }` }>{ child }</Fragment>;
			}

			return (
				<Fragment key={ `child-${ index }` }>
					{ child }
					{ index < totalChildren - 1 && (
						<CardDivider className="domain-suggestions-list__divider" />
					) }
				</Fragment>
			);
		} );
	}, [ children ] );

	return (
		<Card ref={ containerRef }>
			<DomainSuggestionContainerContext.Provider value={ contextValue }>
				{ childrenWithSeparators }
			</DomainSuggestionContainerContext.Provider>
		</Card>
	);
};
