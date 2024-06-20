/* eslint-disable no-restricted-imports */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect } from 'react';
import SearchCard from 'calypso/components/search-card';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

type Props = {
	searchQuery: string;
	location?: string;
	isVisible?: boolean;
	placeholder?: string;
	onSearch?: ( query: string ) => void;
	sectionName: string;
};

const AUTO_FOCUS_LOCATION = [ 'help-center', 'inline-help-popover' ];

const InlineHelpSearchCard = ( {
	searchQuery = '',
	location = 'inline-help-popover',
	isVisible = true,
	placeholder,
	onSearch,
	sectionName,
}: Props ) => {
	const cardRef = useRef< { searchInput: HTMLInputElement } >();
	const translate = useTranslate();

	// Focus in the input element.
	useEffect( () => {
		const inputElement = cardRef.current?.searchInput;
		if ( ! AUTO_FOCUS_LOCATION.includes( location ) || ! inputElement || ! isVisible ) {
			return;
		}

		const timerId = setTimeout( () => inputElement.focus(), 0 );

		return () => window.clearTimeout( timerId );
	}, [ cardRef, location, isVisible ] );

	const searchHelperHandler = ( query: string ) => {
		const inputQuery = query.trim();

		if ( location === 'help-center' ) {
			if ( inputQuery?.length > 2 ) {
				recordTracksEvent( 'calypso_inlinehelp_search', {
					search_query: query,
					location: location,
					section: sectionName,
				} );
			}
		} else if ( inputQuery?.length ) {
			debug( 'search query received: ', query );
			recordTracksEvent( 'calypso_inlinehelp_search', {
				search_query: query,
				location: location,
				section: sectionName,
			} );
		}

		// Set the query search
		onSearch?.( query );
	};

	return (
		<SearchCard
			ref={ cardRef }
			initialValue={ searchQuery }
			onSearch={ searchHelperHandler }
			placeholder={ placeholder || translate( 'Search for help…' ) }
			delaySearch
		/>
	);
};

export default InlineHelpSearchCard;
