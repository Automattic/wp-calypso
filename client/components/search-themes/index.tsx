import { SearchControl } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import Search, { SEARCH_MODE_ON_ENTER } from 'calypso/components/search';
import './style.scss';

interface SearchThemesProps {
	query: string;
	onSearch: ( query: string ) => void;
	recordTracksEvent: ( eventName: string, eventProperties?: object ) => void;
}
const SearchThemes: React.FC< SearchThemesProps > = ( { query, onSearch, recordTracksEvent } ) => {
	const translate = useTranslate();
	const [ searchInput, setSearchInput ] = useState( query );

	const onKeyDown = useCallback(
		( event: React.KeyboardEvent< HTMLInputElement > ) => {
			if ( event.key === 'Enter' ) {
				onSearch( searchInput );
			}
		},
		[ onSearch, searchInput ]
	);

	const onClearSearch = useCallback( () => {
		onSearch( '' );
		recordTracksEvent( 'search_clear_icon_click' );
	}, [ onSearch, recordTracksEvent ] );

	useEffect( () => {
		if ( searchInput === '' && query !== '' ) {
			onClearSearch();
		}
	}, [ searchInput, query, onClearSearch ] );

	return (
		<div>
			<div
				className={ clsx( 'search-themes-card' ) }
				role="presentation"
				data-tip-target="search-themes-card"
			>
				<SearchControl
					value={ searchInput }
					placeholder={ translate( 'Search themes…' ) }
					onChange={ setSearchInput }
					onKeyDown={ onKeyDown }
				/>
			</div>
		</div>
	);
};

interface SearchThemesV2Props {
	query: string;
	onSearch: ( query: string ) => void;
}

const SearchThemesV2: React.FC< SearchThemesV2Props > = ( { query, onSearch } ) => {
	const translate = useTranslate();

	return (
		<div className="search-themes-card" role="presentation" data-tip-target="search-themes-card">
			<Search
				initialValue={ query }
				value={ query }
				placeholder={ translate( 'Search themes…' ) }
				analyticsGroup="Themes"
				searchMode={ SEARCH_MODE_ON_ENTER }
				onSearch={ onSearch }
			/>
		</div>
	);
};

export { SearchThemes, SearchThemesV2 };
