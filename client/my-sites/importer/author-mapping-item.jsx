import { Gridicon } from '@automattic/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { localize } from 'i18n-calypso';
import { defer } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import AuthorSelector from 'calypso/blocks/author-selector';
import User from 'calypso/components/user';
import useUsersQuery from 'calypso/data/users/use-users-query';
import { decodeEntities } from 'calypso/lib/formatting';
import './author-mapping-item.scss';

const userShape = ( nameField ) =>
	PropTypes.shape( {
		ID: PropTypes.number.isRequired,
		[ nameField ]: PropTypes.string.isRequired,
		avatar_URL: PropTypes.string.isRequired,
	} );

class ImporterAuthorMapping extends PureComponent {
	static displayName = 'ImporterAuthorMapping';

	static propTypes = {
		hasSingleAuthor: PropTypes.bool.isRequired,
		onSelect: PropTypes.func,
		siteId: PropTypes.number.isRequired,
		sourceAuthor: PropTypes.shape( {
			id: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
			icon: PropTypes.string,
			// `currentUser` has `.display_name` and is used to map author on single author sites
			// `users` endpoint returns `.name` and is used for multiple author sites
			mappedTo: PropTypes.oneOfType( [ userShape( 'name' ), userShape( 'display_name' ) ] ),
		} ).isRequired,
		currentUser: PropTypes.object,
	};

	componentDidMount() {
		const { hasSingleAuthor, onSelect: selectAuthor, users } = this.props;
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
			defer( () => selectAuthor( users[ 0 ] ) );
		}
	}

	render() {
		const {
			hasSingleAuthor,
			siteId,
			onSelect,
			sourceAuthor: {
				icon,
				name,
				mappedTo: selectedAuthor = { name: /* Don't translate yet */ 'Choose an author…' },
			},
			users,
		} = this.props;

		return (
			<div className="importer__author-mapping">
				<span className="importer__source-author">
					{ icon ? (
						<img
							className="importer__icon"
							alt={ name }
							title={ name }
							src={ icon }
							width="26"
							height="26"
						/>
					) : (
						''
					) }
					<span>{ decodeEntities( name ) }</span>
				</span>
				<Gridicon className="importer__mapping-relation" icon="arrow-right" />
				{ ! hasSingleAuthor ? (
					<AuthorSelector siteId={ siteId } onSelect={ onSelect }>
						<User user={ selectedAuthor } />
					</AuthorSelector>
				) : (
					<User user={ users[ 0 ] } />
				) }
			</div>
		);
	}
}

const withUsers = createHigherOrderComponent(
	( Component ) => ( props ) => {
		const { siteId } = props;
		const { data } = useUsersQuery( siteId );

		const users = data?.users ?? [];

		return <Component users={ users } { ...props } />;
	},
	'withTotalUsers'
);

export default localize( withUsers( ImporterAuthorMapping ) );
