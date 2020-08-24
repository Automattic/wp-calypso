/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import Gridicon from 'components/gridicon';
import { connect } from 'react-redux';
import { defer } from 'lodash';

/**
 * Internal dependencies
 */
import AuthorSelector from 'blocks/author-selector';
import User from 'components/user';
import { getCurrentUser } from 'state/current-user/selectors';
import { decodeEntities } from 'lib/formatting';

/**
 * Style dependencies
 */
import './author-mapping-item.scss';

const userShape = ( nameField ) =>
	PropTypes.shape( {
		ID: PropTypes.number.isRequired,
		[ nameField ]: PropTypes.string.isRequired,
		avatar_URL: PropTypes.string.isRequired,
	} );

class ImporterAuthorMapping extends React.Component {
	static displayName = 'ImporterAuthorMapping';

	static propTypes = {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onSelect: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthor: PropTypes.shape( {
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			// `currentUser` has `.display_name` and is used to map author on single author sites
			// `users` endpoint returns `.name` and is used for multiple author sites
			mappedTo: PropTypes.oneOfType( [ userShape( 'name' ), userShape( 'display_name' ) ] ),
		} ).isRequired,
		currentUser: PropTypes.object,
	};

	componentDidMount() {
		const { hasSingleAuthor, onSelect: selectAuthor } = this.props;

		if ( hasSingleAuthor ) {
			/**
			 * Using `defer` here is a leftover from using Flux store in the past.
			 *
			 * It's not ideal and should be refactored in the future to read
			 * the state, instead of automating the UI in this way.
			 *
			 * This effort is quite big as it requires refactoring a few things on more fundamental
			 * level in the imports section.
			 *
			 * TODO: Refactor this to not automate the UI but use proper state
			 * TODO: A better way might be to handle this call in the backend and leave the UI out of the decision
			 */
			defer( () => selectAuthor( this.props.currentUser ) );
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
				<span className="importer__source-author">{ decodeEntities( name ) }</span>
				<Gridicon className="importer__mapping-relation" icon="arrow-right" />
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

export default connect( ( state ) => ( {
	currentUser: getCurrentUser( state ),
} ) )( ImporterAuthorMapping );
