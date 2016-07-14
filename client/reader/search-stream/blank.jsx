import React from 'react';
import { localize } from 'i18n-calypso'

export function BlankContent( { translate, suggestions } ) {
	var suggest = null;
	if ( suggestions ) {
		var sugList = suggestions.map( function( query ) {
			return <a href={ '/read/search?q=' + encodeURIComponent( query ) } >{ query }</a>;
		} );
		//join the link elements into a comma separated list
		sugList = sugList.slice(1).reduce(function(xs, x, i) {
			return xs.concat([', ', x]);
		}, [ sugList[0] ] );
		suggest = <p>{translate( 'Staff Suggestions: {{suggestions /}}.', { components: { suggestions: sugList } })}</p>;
	}

	const imgPath = '/calypso/images/drake/drake-404.svg';
	return (
		<div className="search-blank-content">
			{ suggest }
			<img src={ imgPath } width="500" className="empty-content__illustration" />
		</div>
	);
}

export default localize( BlankContent );
