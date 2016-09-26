/**
 * External dependencies
 */
import React from 'react';

const getRegExpFor = function( type, textToHighlight ) {
	const expressions = {};

	expressions.username = '(^' + textToHighlight + ')(\\w*)\\s*';
	expressions.fullname = '(^.*?)(\\b' + textToHighlight + ')(.*)';

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
				item = <strong key={ i }>{matches[ i ]}</strong>;
				highlighted = true;
			}

			highlights.push( item );
		}

		return highlights;
	}

	return [ content ];
};

module.exports = React.createClass( {
	render: function() {
		const username = highlight( this.props.username, this.props.suggestionsQuery, 'username' );
		username.unshift( '@' );

		const fullName = highlight( this.props.fullName, this.props.suggestionsQuery, 'fullname' );

		return (
			<div className="suggestion">
				<img src={ this.props.avatarUrl } />
				<span className="username">{ username }</span>
				<small>{ fullName }</small>
			</div>
		);
	}
} );
