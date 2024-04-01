import page from '@automattic/calypso-router';
import { useLocale } from '@automattic/i18n-utils';
import { ENTER } from '@wordpress/keycodes';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import Search from 'calypso/components/search';
import { QUERY_PARAM_SEARCH } from 'calypso/my-sites/patterns/hooks/use-pattern-search-term';
import { usePatterns } from 'calypso/my-sites/patterns/hooks/use-patterns';
import { usePatternsContext } from '../../context';

type PatternsSearchFieldProps = {
	isOpen?: boolean;
};

export const PatternsSearchField = ( { isOpen = true }: PatternsSearchFieldProps ) => {
	const translate = useTranslate();
	const { searchTerm, category } = usePatternsContext();
	const locale = useLocale();
	const { isRefetching: isRefetchingPatterns } = usePatterns( locale, category );
	const [ tmpSearchTerm, setTmpSearchTerm ] = useState< string | null >( null );

	const value = tmpSearchTerm !== null ? tmpSearchTerm : searchTerm;

	useEffect( () => {
		setTmpSearchTerm( null );
	}, [ searchTerm ] );

	const handleSearch = ( newValue: string = value ) => {
		const url = new URL( window.location.href );

		if ( newValue ) {
			url.searchParams.set( QUERY_PARAM_SEARCH, newValue );

			// Strip out `ref` parameter when updating the URL for search
			// to ensure the referrer is only be reported in the initial page view.
			url.searchParams.delete( 'ref' );
		} else {
			url.searchParams.delete( QUERY_PARAM_SEARCH );
		}

		if ( url.href !== location.href ) {
			page( url.href.replace( url.origin, '' ) );
		}
	};

	return (
		<Search
			placeholder={ translate( 'Search patterns…' ) }
			additionalClasses={ classNames( { 'search-has-value': !! value } ) }
			isOpen={ isOpen }
			pinned={ ! isOpen } // need for `isOpen` prop, otherwise it won't work
			disabled={ isRefetchingPatterns }
			initialValue={ searchTerm }
			value={ value }
			onSearch={ setTmpSearchTerm }
			onKeyDown={ ( event: React.KeyboardEvent< HTMLInputElement > ) => {
				const keyCode = event.keyCode as unknown as number;

				if ( keyCode === ENTER ) {
					handleSearch();
				}
			} }
			onSearchClose={ () => handleSearch( '' ) }
		/>
	);
};
