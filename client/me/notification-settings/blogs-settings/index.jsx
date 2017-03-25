/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import EmptyContentComponent from 'components/empty-content';
import Blog from './blog';
import InfiniteList from 'components/infinite-list';
import Placeholder from './placeholder';
import config from 'config';

export default React.createClass( {
	displayName: 'BlogsSettings',

	propTypes: {
		blogs: PropTypes.object.isRequired,
		devices: PropTypes.object.isRequired,
		settings: PropTypes.instanceOf( Immutable.List ),
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func.isRequired
	},

	render() {
		if ( ! this.props.blogs.initialized || ! this.props.devices.initialized || ! this.props.settings ) {
			return <Placeholder />;
		}

		if ( this.props.blogs.get().length === 0 ) {
			return <EmptyContentComponent
				title={ this.translate( 'You don\'t have any WordPress sites yet.' ) }
				line={ this.translate( 'Would you like to start one?' ) }
				action={ this.translate( 'Create Site' ) }
				actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
				illustration={ '/calypso/images/drake/drake-nosites.svg' } />
		}

		const renderBlog = ( blog, index, disableToggle = false ) => {
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
		}

		if ( this.props.blogs.get().length === 1 ) {
			return renderBlog( this.props.blogs.get()[ 0 ], null, true );
		}

		return (
			<InfiniteList
				items={ this.props.blogs.get() }
				lastPage={ true }
				fetchNextPage={ () => {} }
				fetchingNextPage={ false }
				guessedItemHeight={ 69 }
				getItemRef={ blog => `blog-${ blog.ID }` }
				renderItem={ renderBlog }
				renderLoadingPlaceholders={ () => <Placeholder /> } />
		);
	}
} );
