import { NavigableMenu, FormTokenField, MenuItem } from '@wordpress/components';
import { useState, useMemo, useCallback, useRef } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import './filters-list.scss';

type Props = {
	availableTlds?: string[];
};

export const DomainSearchControlsFiltersList = ( { availableTlds = [] }: Props ) => {
	const containerRef = useRef< HTMLDivElement >( null );
	const { __ } = useI18n();
	const [ selectedTlds, setSelectedTlds ] = useState< string[] >( [] );
	const [ searchTerm, setSearchTerm ] = useState( '' );

	// Memoize suggestions to avoid recalculating on every render
	const recommendedTlds = useMemo( () => {
		return availableTlds
			.slice( 0, 5 )
			.filter(
				( tld ) =>
					! selectedTlds.includes( tld ) && tld.toLowerCase().includes( searchTerm.toLowerCase() )
			);
	}, [ availableTlds, selectedTlds, searchTerm ] );

	const moreTlds = useMemo( () => {
		return availableTlds
			.slice( 5 )
			.filter(
				( tld ) =>
					! selectedTlds.includes( tld ) && tld.toLowerCase().includes( searchTerm.toLowerCase() )
			);
	}, [ availableTlds, selectedTlds, searchTerm ] );

	// Memoize the onChange handler to avoid recreating it on every render
	const clearSearchInput = useCallback( () => {
		const input = containerRef.current?.querySelector< HTMLInputElement >(
			'.components-form-token-field input'
		);

		if ( input ) {
			input.value = '';
			setSearchTerm( '' );
		}
	}, [ setSearchTerm ] );

	const handleTokenChange = useCallback(
		( token: string ) => {
			setSelectedTlds( ( prev ) => [ ...prev, token ] );
			clearSearchInput();
		},
		[ clearSearchInput ]
	);

	return (
		<div className="domain-search-controls__filters-list" ref={ containerRef }>
			<FormTokenField
				label=""
				value={ selectedTlds }
				placeholder={ __( 'Search for an ending' ) }
				__experimentalShowHowTo={ false }
				__next40pxDefaultSize
				displayTransform={ ( item ) => `.${ item }` }
				onInputChange={ setSearchTerm }
			/>

			<NavigableMenu
				className="domain-search-controls__filters-list-suggestions"
				cycle
				onKeyDown={ ( event ) => {
					if ( event.key === 'Tab' ) {
						event.preventDefault();
						// TODO: Focus the next sibling element
						return;
					}
				} }
			>
				{ !! recommendedTlds.length && (
					<>
						<h3 className="domain-search-controls__filters-list-heading">
							{ __( 'Recommended' ) }
						</h3>
						{ recommendedTlds.map( ( tld ) => (
							<MenuItem
								key={ tld }
								isSelected={ selectedTlds.includes( tld ) }
								onClick={ () => handleTokenChange( tld ) }
							>
								.{ tld }
							</MenuItem>
						) ) }
					</>
				) }
				{ !! moreTlds.length && (
					<>
						<h3 className="domain-search-controls__filters-list-heading">
							{ __( 'Explore more' ) }
						</h3>
						{ moreTlds.map( ( tld ) => (
							<MenuItem
								key={ tld }
								isSelected={ selectedTlds.includes( tld ) }
								onClick={ () => handleTokenChange( tld ) }
							>
								.{ tld }
							</MenuItem>
						) ) }
					</>
				) }
			</NavigableMenu>
		</div>
	);
};
