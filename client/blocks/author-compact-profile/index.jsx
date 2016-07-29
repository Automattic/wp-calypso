/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Gravatar from 'components/gravatar';
import ReaderAuthorLink from 'components/reader-author-link';

const AuthorCompactProfile = React.createClass( {
	propTypes: {
		author: React.PropTypes.object.isRequired
	},

	render() {
		const author = this.props.author;
		return (
			<div className="author-compact-profile">
				<Gravatar size={ 96 } user={ author } />
				<ReaderAuthorLink author={ author }>{ author.display_name }</ReaderAuthorLink>
			</div>
		);
	}

} );

export default AuthorCompactProfile;
