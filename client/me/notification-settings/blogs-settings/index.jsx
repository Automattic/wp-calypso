import { Card } from '@automattic/components';
import Search, { useFuzzySearch } from '@automattic/search';
import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import { localize } from 'i18n-calypso';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import InfiniteList from 'calypso/components/infinite-list';
import getSites from 'calypso/state/selectors/get-sites';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import { addDotSuffix } from 'calypso/utils';
import Blog from './blog';
import Placeholder from './placeholder';

import './style.scss';

const createPlaceholder = () => <Placeholder />;
const noop = () => {};
const getItemRef = ( { ID } ) => `blog-${ ID }`;

const BlogSearch = styled( Search )( {
	boxShadow: '0 0 0 1px var(--color-border-subtle)',
} );

const SITES_SEARCH_INDEX_KEYS = [ 'name', 'domain' ];

const FilteredInfiniteList = ( props ) => {
	const { __ } = useI18n();
	const filteredItems = useFuzzySearch( {
		data: props.items,
		keys: SITES_SEARCH_INDEX_KEYS,
		query: props.searchTerm ?? '',
	} );
	return (
		<Fragment>
			{ filteredItems.length >= 1 && (
				<InfiniteList
					items={ filteredItems }
					lastPage={ true }
					fetchNextPage={ noop }
					fetchingNextPage={ false }
					guessedItemHeight={ 69 }
					getItemRef={ getItemRef }
					renderItem={ props.renderItem }
					renderLoadingPlaceholders={ createPlaceholder }
				/>
			) }
			{ filteredItems.length === 0 && (
				<Card compact={ true }>{ __( 'No sites match your search.' ) }</Card>
			) }
		</Fragment>
	);
};

class BlogsSettings extends Component {
	static propTypes = {
		sites: PropTypes.array.isRequired,
		requestingSites: PropTypes.bool.isRequired,
		settings: PropTypes.array,
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func.isRequired,
	};

	state = { searchTerm: '' };

	render() {
		const { sites, requestingSites } = this.props;

		if ( ! sites || ! this.props.settings ) {
			return <Placeholder />;
		}

		if ( sites.length === 0 && ! requestingSites ) {
			return <NoSitesMessage />;
		}

		const renderBlog = ( site, index, disableToggle = false ) => {
			const onSave = () => this.props.onSave( site.ID );
			const onSaveToAll = () => this.props.onSaveToAll( site.ID );
			const blogSettings = find( this.props.settings, { blog_id: site.ID } ) || {};

			return (
				<Blog
					key={ `blog-${ site.ID }` }
					siteId={ site.ID }
					disableToggle={ disableToggle }
					hasUnsavedChanges={ this.props.hasUnsavedChanges }
					settings={ blogSettings }
					onToggle={ this.props.onToggle }
					onSave={ onSave }
					onSaveToAll={ onSaveToAll }
				/>
			);
		};

		if ( sites.length === 1 ) {
			return renderBlog( sites[ 0 ], null, true );
		}

		return (
			<Fragment>
				{ sites.length >= 10 && (
					<BlogSearch
						onSearch={ ( searchTerm ) => {
							this.setState( { searchTerm } );
						} }
						isReskinned
						placeholder={ this.props.translate( 'Search by name or domain…' ) }
						disableAutocorrect={ true }
						defaultValue=""
					/>
				) }
				<FilteredInfiniteList
					searchTerm={ addDotSuffix( this.state.searchTerm ) }
					items={ sites }
					renderItem={ renderBlog }
				/>
			</Fragment>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	sites: getSites( state ),
	requestingSites: isRequestingSites( state ),
} );

export default connect( mapStateToProps )( localize( BlogsSettings ) );
