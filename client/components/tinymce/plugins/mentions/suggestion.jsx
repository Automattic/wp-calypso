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
	const matcher = getRegExpFor( type, textToHighlight );
	const matches = matcher.exec( content );

	if ( ! matches ) {
		return [ content ];
	}

	return matches.map( ( item, i ) => {
		if ( i === 0 ) {
			return '';
		}

		if ( textToHighlight.toLowerCase() === item.toLowerCase() ) {
			return <mark className="mentions__highlight" key={ i }>{ item }</mark>;
		}

		return item;
	} );
};

const Suggestion = ( { avatarUrl, username, fullName, query } ) => {
	const highlightedUsername = highlight( username, query, 'username' );
	const highlightedFullName = highlight( fullName, query, 'fullName' );

	highlightedUsername.unshift( '@' );

	return (
		<div>
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
