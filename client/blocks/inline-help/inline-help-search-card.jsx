import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SearchCard from 'calypso/components/search-card';
import { useHelpSearchQuery } from 'calypso/data/help/use-help-search-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

/**
 * Module variables
 */
const debug = debugFactory( 'calypso:inline-help' );

const InlineHelpSearchCard = ( {
	searchQuery = '',
	location = 'inline-help-popover',
	isVisible = true,
	placeholder,
	onSearch,
} ) => {
	const cardRef = useRef();
	const translate = useTranslate();
	const dispatch = useDispatch();
	const { isLoading: isSearching } = useHelpSearchQuery( searchQuery );

	// Focus in the input element.
	useEffect( () => {
		const inputElement = cardRef.current?.searchInput;
		// Focuses only in the popover.
		if ( location !== 'inline-help-popover' || ! inputElement || ! isVisible ) {
			return;
		}

		const timerId = setTimeout( () => inputElement.focus(), 0 );

		return () => window.clearTimeout( timerId );
	}, [ cardRef, location, isVisible ] );

	const searchHelperHandler = ( query ) => {
		const inputQuery = query.trim();

		if ( inputQuery?.length ) {
			debug( 'search query received: ', searchQuery );
			dispatch(
				recordTracksEvent( 'calypso_inlinehelp_search', {
					search_query: searchQuery,
					location: location,
				} )
			);
		}

		// Set the query search
		onSearch?.( query );
	};

	return (
		<SearchCard
			ref={ cardRef }
			searching={ isSearching }
			initialValue={ searchQuery }
			onSearch={ searchHelperHandler }
			placeholder={ placeholder || translate( 'Search for help…' ) }
			delaySearch
		/>
	);
};

InlineHelpSearchCard.propTypes = {
	searchQuery: PropTypes.string,
	onSearch: PropTypes.func,
	placeholder: PropTypes.string,
	location: PropTypes.string,
};

export default InlineHelpSearchCard;
