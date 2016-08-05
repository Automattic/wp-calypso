/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import { recordTrack } from 'reader/stats';

export function BlankContent( { translate, suggestions } ) {
	const handleSuggestionClick = ( suggestion ) => {
		recordTrack( 'calypso_reader_search_suggestion_click', { suggestion } );
	};

	let suggest = null;
	if ( suggestions ) {
		let sugList = suggestions
			.map( function( query ) {
				return (
					<a onClick={ () => handleSuggestionClick( query ) } href={ '/read/search?q=' + encodeURIComponent( query ) } >
						{ query }
					</a>
				);
			} );
		sugList = sugList
			.slice( 1 )
			.reduce( function( xs, x ) {
				return xs.concat( [ ', ', x ] );
			}, [ sugList[ 0 ] ] );

		suggest = (
			<p className="search-stream__blank-suggestions">
				{ translate( 'Suggestions: {{suggestions /}}.', { components: { suggestions: sugList } } ) }
			</p> );
	}

	const imgPath = '/calypso/images/drake/drake-404.svg';

	return (
		<div className="search-stream__blank">
			{ suggest }
			<img src={ imgPath } width="500" className="empty-content__illustration" />
		</div>
	);
}

export default localize( BlankContent );
