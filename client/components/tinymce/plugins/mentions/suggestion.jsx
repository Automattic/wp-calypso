/**
 * External dependencies
 */
import React from 'react';

const getRegExpFor = function( type, textToHighlight ) {
	const expressions = {};

	expressions.username = '(^' + textToHighlight + ')(\\w*)\\s*';
	expressions.fullName = '(^.*?)(\\b' + textToHighlight + ')(.*)';

	return new RegExp( expressions[ type ], 'ig' );
};

const highlight = function( content, textToHighlight, type ) {
	const matcher = getRegExpFor( type, textToHighlight ),
		matches = matcher.exec( content );

	if ( matches ) {
		const highlights = [];
		let highlighted = false;

		for ( let i = 1, length = matches.length; i < length; i++ ) {
			let item = matches[ i ];

			if ( textToHighlight.toLowerCase() === item.toLowerCase() && ! highlighted ) {
				item = <strong className="mentions__highlight" key={ i }>{ matches[ i ] }</strong>;
				highlighted = true;
			}

			highlights.push( item );
		}

		return highlights;
	}

	return [ content ];
};

const Suggestion = ( { avatarUrl, username, fullName, query } ) => {
	const highlightedUsername = highlight( username, query, 'username' );
	const highlightedFullName = highlight( fullName, query, 'fullName' );

	highlightedUsername.unshift( '@' );

	return (
		<div className="mentions__suggestion">
			<img className="mentions__avatar" src={ avatarUrl } />
			<span className="mentions__username">{ highlightedUsername }</span>
			<small className="mentions__fullname">{ highlightedFullName }</small>
		</div>
	);
};

Suggestion.propTypes = {
	avatarUrl: React.PropTypes.string,
	username: React.PropTypes.string,
	fullName: React.PropTypes.string,
	query: React.PropTypes.string,
};

Suggestion.defaultProps = {
	avatarUrl: '',
	username: '',
	fullName: '',
	query: '',
};

export default Suggestion;
