import { useRefEffect } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import type { SuggestionsListProps } from './types';
import type { MouseEventHandler, ReactNode } from 'react';

const handleMouseDown: MouseEventHandler = ( e ) => {
	// By preventing default here, we will not lose focus of <input> when clicking a suggestion.
	e.preventDefault();
};

export function SuggestionsList< T extends string | { value: string; disabled?: boolean } >( {
	selectedIndex,
	scrollIntoView,
	match,
	onHover,
	onSelect,
	suggestions = [],
	displayTransform,
	instanceId,
	__experimentalRenderItem,
}: SuggestionsListProps< T > ) {
	const listRef = useRefEffect< HTMLUListElement >(
		( listNode ) => {
			// only have to worry about scrolling selected suggestion into view
			// when already expanded.
			if ( selectedIndex > -1 && scrollIntoView && listNode.children[ selectedIndex ] ) {
				listNode.children[ selectedIndex ].scrollIntoView( {
					behavior: 'instant',
					block: 'nearest',
					inline: 'nearest',
				} );
			}
		},
		[ selectedIndex, scrollIntoView ]
	);

	const handleHover = ( suggestion: T ) => {
		return () => {
			onHover?.( suggestion );
		};
	};

	const handleClick = ( suggestion: T ) => {
		return () => {
			onSelect?.( suggestion );
		};
	};

	const computeSuggestionMatch = ( suggestion: T ) => {
		const matchText = displayTransform( match ).normalize( 'NFKC' ).toLocaleLowerCase();
		if ( matchText.length === 0 ) {
			return null;
		}

		const transformedSuggestion = displayTransform( suggestion );
		const indexOfMatch = transformedSuggestion
			.normalize( 'NFKC' )
			.toLocaleLowerCase()
			.indexOf( matchText );

		return {
			suggestionBeforeMatch: transformedSuggestion.substring( 0, indexOfMatch ),
			suggestionMatch: transformedSuggestion.substring(
				indexOfMatch,
				indexOfMatch + matchText.length
			),
			suggestionAfterMatch: transformedSuggestion.substring( indexOfMatch + matchText.length ),
		};
	};

	return (
		<ul
			ref={ listRef }
			className="components-form-token-field__suggestions-list"
			id={ `components-form-token-suggestions-${ instanceId }` }
			role="listbox"
		>
			{ suggestions.map( ( suggestion, index ) => {
				const matchText = computeSuggestionMatch( suggestion );
				const isSelected = index === selectedIndex;
				const isDisabled = typeof suggestion === 'object' && suggestion?.disabled;
				const key =
					typeof suggestion === 'object' && 'value' in suggestion
						? suggestion?.value
						: displayTransform( suggestion );

				const className = clsx( 'components-form-token-field__suggestion', {
					'is-selected': isSelected,
				} );

				let output: ReactNode;

				if ( typeof __experimentalRenderItem === 'function' ) {
					output = __experimentalRenderItem( { item: suggestion } );
				} else if ( matchText ) {
					output = (
						<span aria-label={ displayTransform( suggestion ) }>
							{ matchText.suggestionBeforeMatch }
							<strong className="components-form-token-field__suggestion-match">
								{ matchText.suggestionMatch }
							</strong>
							{ matchText.suggestionAfterMatch }
						</span>
					);
				} else {
					output = displayTransform( suggestion );
				}

				/* eslint-disable jsx-a11y/click-events-have-key-events */
				return (
					<li
						id={ `components-form-token-suggestions-${ instanceId }-${ index }` }
						role="option"
						className={ className }
						key={ key }
						onMouseDown={ handleMouseDown }
						onClick={ handleClick( suggestion ) }
						onMouseEnter={ handleHover( suggestion ) }
						aria-selected={ index === selectedIndex }
						aria-disabled={ isDisabled }
					>
						{ output }
					</li>
				);
				/* eslint-enable jsx-a11y/click-events-have-key-events */
			} ) }
			{ suggestions.length === 0 && (
				<li className="components-form-token-field__suggestion is-empty">
					{ __( 'No items found' ) }
				</li>
			) }
		</ul>
	);
}

export default SuggestionsList;
