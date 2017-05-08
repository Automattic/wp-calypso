/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

const Suggestion = ( { avatarUrl, fullName, query, username } ) => {
	const highlight = ( content, type ) => {
		const expressions = {
			username: `(^${ query })(\\w*)\\s*`,
			fullName: `(^.*?)(\\b${ query })(.*)`,
		};

		const matches = new RegExp( expressions[ type ], 'ig' ).exec( content );

		if ( ! matches ) {
			return [ content ];
		}

		return matches.map( ( item, index ) => {
			if ( index === 0 ) {
				return '';
			}

			if ( query.toLowerCase() === item.toLowerCase() ) {
				return <mark className="mentions__highlight" key={ index }>{ item }</mark>;
			}

			return item;
		} );
	};

	const highlightedUsername = highlight( username, 'username' );
	const highlightedFullName = highlight( fullName, 'fullName' );

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
	avatarUrl: PropTypes.string,
	fullName: PropTypes.string,
	query: PropTypes.string,
	username: PropTypes.string,
};

Suggestion.defaultProps = {
	avatarUrl: '',
	fullName: '',
	query: '',
	username: '',
};

export default Suggestion;
