/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Style dependencies
 */
import './suggestion.scss';

const UserMentionsSuggestion = ( { avatarUrl, fullName, query, username } ) => {
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
				return (
					<mark className="user-mentions__highlight" key={ index }>
						{ item }
					</mark>
				);
			}

			return item;
		} );
	};

	const highlightedUsername = highlight( username, 'username' );
	const highlightedFullName = highlight( fullName, 'fullName' );

	highlightedUsername.unshift( '@' );

	return (
		<div>
			<img className="user-mentions__avatar" src={ avatarUrl } alt="" />
			<span className="user-mentions__username">{ highlightedUsername }</span>
			<small className="user-mentions__fullname">{ highlightedFullName }</small>
		</div>
	);
};

UserMentionsSuggestion.propTypes = {
	avatarUrl: PropTypes.string,
	fullName: PropTypes.string,
	query: PropTypes.string,
	username: PropTypes.string,
};

UserMentionsSuggestion.defaultProps = {
	avatarUrl: '',
	fullName: '',
	query: '',
	username: '',
};

export default UserMentionsSuggestion;
