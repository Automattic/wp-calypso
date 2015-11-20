/**
 * External dependencies
 */
import React, { PropTypes } from 'react';

/**
 * Internal dependencies
 */
import AuthorSelector from 'components/author-selector';
import UserItem from 'components/user';
import user from 'lib/user';

export default React.createClass( {
	displayName: 'ImporterAuthorMapping',

	mixins: [ React.addons.PureRenderMixin ],

	propTypes: {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onSelect: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthor: PropTypes.shape( {
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			mappedTo: PropTypes.shape( {
				ID: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
				avatar_URL: PropTypes.string.isRequired
			} )
		} ).isRequired
	},

	getCurrentUser() {
		const currentUser = user().get();

		return Object.assign( {}, currentUser, { name: currentUser.display_name } );
	},

	render: function() {
		const { hasSingleAuthor, siteId, onSelect, sourceAuthor: { name, mappedTo: selectedAuthor = { name: /* Don't translate yet */ 'Choose an author…' } } } = this.props;

		return (
			<div className="importer__author-mapping">
				<span className="importer__source-author">
					{ name }
				</span>
				<span className="importer__mapping-relation" />
				{ ! hasSingleAuthor ?
					<AuthorSelector siteId={ siteId } onSelect={ onSelect }>
						<UserItem user={ selectedAuthor } />
					</AuthorSelector>
				:
					<UserItem user={ this.getCurrentUser() } />
				}
			</div>
		);
	}
} );
