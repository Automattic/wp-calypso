/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import UserItem from 'components/user';
import { getCurrentUser } from 'state/current-user/selectors';

class ImporterAuthorMapping extends React.Component {
	static displayName = 'ImporterAuthorMapping';

	static propTypes = {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onSelect: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthor: PropTypes.shape( {
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			mappedTo: PropTypes.shape( {
				ID: PropTypes.number.isRequired,
				name: PropTypes.string.isRequired,
				avatar_URL: PropTypes.string.isRequired,
			} ),
		} ).isRequired,
	};

	componentWillMount() {
		const { hasSingleAuthor, onSelect: selectAuthor } = this.props;

		if ( hasSingleAuthor ) {
			selectAuthor( this.getCurrentUser() );
		}
	}

	getCurrentUser = () => ( {
		...this.props.currentUser,
		name: this.props.currentUser.display_name,
	} );

	render() {
		const {
			hasSingleAuthor,
			siteId,
			onSelect,
			sourceAuthor: {
				name,
				mappedTo: selectedAuthor = { name: /* Don't translate yet */ 'Choose an author…' },
			},
		} = this.props;

		return (
			<div className="importer__author-mapping">
				<span className="importer__source-author">{ name }</span>
				<Gridicon className="importer__mapping-relation" icon="arrow-right" />
				{ ! hasSingleAuthor ? (
					<AuthorSelector siteId={ siteId } onSelect={ onSelect }>
						<UserItem user={ selectedAuthor } />
					</AuthorSelector>
				) : (
					<UserItem user={ this.getCurrentUser() } />
				) }
			</div>
		);
	}
}

export default connect( state => ( { currentUser: getCurrentUser( state ) } ) )(
	ImporterAuthorMapping
);
