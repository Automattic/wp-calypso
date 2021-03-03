/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import getSites from 'calypso/state/selectors/get-sites';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import NoSitesMessage from 'calypso/components/empty-content/no-sites-message';
import Blog from './blog';
import InfiniteList from 'calypso/components/infinite-list';
import Placeholder from './placeholder';

/**
 * Style dependencies
 */
import './style.scss';

const createPlaceholder = () => <Placeholder />;

const getItemRef = ( { ID } ) => `blog-${ ID }`;

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
			<InfiniteList
				items={ sites }
				lastPage={ true }
				fetchNextPage={ noop }
				fetchingNextPage={ false }
				guessedItemHeight={ 69 }
				getItemRef={ getItemRef }
				renderItem={ renderBlog }
				renderLoadingPlaceholders={ createPlaceholder }
			/>
		);
	}
}

const mapStateToProps = ( state ) => ( {
	sites: getSites( state ),
	requestingSites: isRequestingSites( state ),
} );

export default connect( mapStateToProps )( BlogsSettings );
