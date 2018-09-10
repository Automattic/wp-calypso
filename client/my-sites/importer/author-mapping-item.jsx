/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import GridiconArrowRight from 'gridicons/dist/arrow-right';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import User from 'components/user';
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
		currentUser: PropTypes.object,
	};

	componentDidMount() {
		const { hasSingleAuthor, onSelect: selectAuthor } = this.props;

		if ( hasSingleAuthor ) {
			selectAuthor( this.props.currentUser );
		}
	}

	render() {
		const {
			hasSingleAuthor,
			siteId,
			onSelect,
			sourceAuthor: {
				name,
				mappedTo: selectedAuthor = { name: /* Don't translate yet */ 'Choose an author…' },
			},
			currentUser,
		} = this.props;

		return (
			<div className="importer__author-mapping">
				<span className="importer__source-author">{ name }</span>
				<GridiconArrowRight className="importer__mapping-relation" />
				{ ! hasSingleAuthor ? (
					<AuthorSelector siteId={ siteId } onSelect={ onSelect }>
						<User user={ selectedAuthor } />
					</AuthorSelector>
				) : (
					<User user={ currentUser } />
				) }
			</div>
		);
	}
}

export default connect( state => ( {
	currentUser: getCurrentUser( state ),
} ) )( ImporterAuthorMapping );
