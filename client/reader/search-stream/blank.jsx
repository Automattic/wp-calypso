/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { localize } from 'i18n-calypso';
import Suggestion from './suggestion';

export function BlankContent( { translate, suggestions } ) {
	let suggest = null;
	if ( suggestions ) {
		let sugList = suggestions
			.map( function( query ) {
				return (
					<Suggestion suggestion={ query } />
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
