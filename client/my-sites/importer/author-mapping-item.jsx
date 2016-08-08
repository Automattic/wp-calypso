/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-pure-render/mixin';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import UserItem from 'components/user';
import user from 'lib/user';
import Gridicon from 'components/gridicon';

export default React.createClass( {
	displayName: 'ImporterAuthorMapping',

	mixins: [ PureRenderMixin ],

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

	componentWillMount() {
		const { hasSingleAuthor, onSelect: selectAuthor } = this.props;

		if ( hasSingleAuthor ) {
			selectAuthor( this.getCurrentUser() );
		}
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
				<Gridicon className="importer__mapping-relation" icon="arrow-right" />
				{ ! hasSingleAuthor
					?	<AuthorSelector siteId={ siteId } onSelect={ onSelect }>
							<UserItem user={ selectedAuthor } />
						</AuthorSelector>
					: 	<UserItem user={ this.getCurrentUser() } />
				}
			</div>
		);
	}
} );
