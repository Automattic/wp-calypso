/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import EmptyContentComponent from 'components/empty-content';
import NoResults from 'my-sites/no-results';
import Blog from './blog';
import URLSearch from 'lib/mixins/url-search';
import SearchCard from 'components/search-card';
import InfiniteList from 'components/infinite-list';
import Placeholder from './placeholder';
import config from 'config';
import escapeRegexp from 'escape-string-regexp';

export default React.createClass( {
	displayName: 'BlogsSettings',

	mixins: [ URLSearch ],

	propTypes: {
		blogs: PropTypes.object.isRequired,
		devices: PropTypes.object.isRequired,
		settings: PropTypes.instanceOf( Immutable.List ),
		search: PropTypes.string,
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func.isRequired
	},

	renderBlogItem( blog, index, disableToggle = false ) {
		return (
			<Blog
				key={ `blog-${ blog.ID }` }
				blog={ blog }
				devices={ this.props.devices }
				disableToggle={ disableToggle }
				hasUnsavedChanges={ this.props.hasUnsavedChanges }
				settings={ this.props.settings.find( settings => settings.get( 'blog_id' ) === blog.ID ) }
				onToggle={ this.props.onToggle }
				onSave={ () => this.props.onSave( blog.ID ) }
				onSaveToAll={ () => this.props.onSaveToAll( blog.ID ) } />
		);
	},

	render() {
		// return a placeholder while settings are loading
		if ( ! this.props.blogs.initialized || ! this.props.devices.initialized || ! this.props.settings ) {
			return <Placeholder />;
		}

		// return a empty content when the user has no sites
		if ( this.props.blogs.get().length === 0 ) {
			return <EmptyContentComponent
				title={ this.translate( 'You don\'t have any WordPress sites yet.' ) }
				line={ this.translate( 'Would you like to start one?' ) }
				action={ this.translate( 'Create Site' ) }
				actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
				illustration={ '/calypso/images/drake/drake-nosites.svg' } />
		}

		// return a single blog item, expanded, whern the user has one site
		if ( this.props.blogs.get().length === 1 ) {
			return this.renderBlogItem( this.props.blogs.get()[0], null, true );
		}

		// filter sites by search keyword
		let items = this.props.blogs.get();
		if ( this.props.search ) {
			const phrase = new RegExp( escapeRegexp( this.props.search ), 'i' );

			items = items.filter( item => {
				return item.URL.search( phrase ) !== -1 || item.name.search( phrase ) !== -1;
			} );
		}

		// return default infintie list and search card
		return (
			<div className="notification-settings-blog-settings">
				<SearchCard
					autoFocus={ true }
					delaySearch={ true }
					placeholder={ this.translate( 'Search your sites' ) }
					initialValue={ this.props.search }
					onSearch={ this.doSearch } />
				{ ( items.length === 0 && this.props.search ) && <NoResults text={ this.translate( 'No sites match that search.' ) } /> }
				<InfiniteList
					items={ items }
					lastPage={ true }
					fetchNextPage={ () => {} }
					fetchingNextPage={ false }
					guessedItemHeight={ 69 }
					getItemRef={ blog => `blog-${ blog.ID }` }
					renderItem={ this.renderBlogItem }
					renderLoadingPlaceholders={ () => <Placeholder /> } />
			</div>
		);
	}
} );
