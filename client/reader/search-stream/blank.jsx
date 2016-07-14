import React from 'react';
import { localize } from 'i18n-calypso';

export function BlankContent( { translate, suggestions } ) {
	let suggest = null;
	if ( suggestions ) {
		let sugList = suggestions
			.map( function( query ) {
				return <a href={ '/read/search?q=' + encodeURIComponent( query ) } >{ query }</a>;
			} );
		sugList = sugList
			.slice( 1 )
			.reduce( function( xs, x ) {
				return xs.concat( [ ', ', x ] );
			}, [ sugList[ 0 ] ] );

		suggest = (
			<p className="search-stream__blank-suggestions">
				{ translate( 'Staff Suggestions: {{suggestions /}}.', { components: { suggestions: sugList } } ) }
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
