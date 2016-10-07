/**
 * External dependencies
 */
import React from 'react';

const Suggestion = React.createClass( {
	displayName: 'Suggestion',

	propTypes: {
		avatarUrl: React.PropTypes.string,
		username: React.PropTypes.string,
		fullName: React.PropTypes.string,
		query: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			avatarUrl: '',
			username: '',
			fullName: '',
			query: ''
		};
	},

	getRegExpFor( type, textToHighlight ) {
		const expressions = {};

		expressions.username = '(^' + textToHighlight + ')(\\w*)\\s*';
		expressions.fullName = '(^.*?)(\\b' + textToHighlight + ')(.*)';

		return new RegExp( expressions[ type ], 'ig' );
	},

	highlight( content, textToHighlight, type ) {
		const matcher = this.getRegExpFor( type, textToHighlight ),
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
	},

	render() {
		const { avatarUrl, username, fullName, query } = this.props,
			highlightedUsername = this.highlight( username, query, 'username' ),
			highlightedFullName = this.highlight( fullName, query, 'fullName' );

		highlightedUsername.unshift( '@' );

		return (
			<div className="mentions__suggestion">
				<img src={ avatarUrl } />
				<span className="mentions__username">{ highlightedUsername }</span>
				<small>{ highlightedFullName }</small>
			</div>
		);
	}
} );

export default Suggestion;
