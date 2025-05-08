import { SearchControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useCallback } from 'react';
import './style.scss';

interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
	recordTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}
const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch, recordTracksEvent } ) => {
	const translate = useTranslate();
	const [ searchInput, setSearchInput ] = useState( query );

	const onClearSearch = useCallback( () => {
		onSearch( '' );
		recordTracksEvent && recordTracksEvent( 'search_clear_icon_click' );
	}, [ onSearch, recordTracksEvent ] );

	const onChange = useCallback(
		( value: string ) => {
			setSearchInput( value );
			if ( value === '' && query !== '' ) {
				onClearSearch();
			}
		},
		[ query, onClearSearch ]
	);

	const onKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( event.key === 'Enter' ) {
				onSearch( searchInput );
			}
		},
		[ onSearch, searchInput ]
	);

	return (
		<div>
			<div
				className={ clsx( 'search-themes-card' ) }
				role="presentation"
				data-tip-target="search-themes-card"
			>
				<SearchControl
					__nextHasNoMarginBottom
					value={ searchInput }
					placeholder={ translate( 'Search themes…' ) }
					onChange={ onChange }
					onKeyDown={ onKeyDown }
				/>
			</div>
		</div>
	);
};

export { SearchThemes };
