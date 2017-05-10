/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Immutable from 'immutable';

/**
 * Internal dependencies
 */
import { getSites } from 'state/selectors';
import EmptyContentComponent from 'components/empty-content';
import Blog from './blog';
import InfiniteList from 'components/infinite-list';
import Placeholder from './placeholder';
import QuerySites from 'components/data/query-sites';
import config from 'config';

const BlogsSettings = React.createClass( {
	displayName: 'BlogsSettings',

	propTypes: {
		sites: PropTypes.array.isRequired,
		devices: PropTypes.object.isRequired,
		settings: PropTypes.instanceOf( Immutable.List ),
		hasUnsavedChanges: PropTypes.bool.isRequired,
		onToggle: PropTypes.func.isRequired,
		onSave: PropTypes.func.isRequired,
		onSaveToAll: PropTypes.func.isRequired
	},

	render() {
		const { sites } = this.props;

		if ( ! sites || ! this.props.devices.initialized || ! this.props.settings ) {
			return (
				<div>
					<QuerySites allSites />
					<Placeholder />
				</div>
			);
		}

		if ( sites.length === 0 ) {
			return <EmptyContentComponent
				title={ this.translate( 'You don\'t have any WordPress sites yet.' ) }
				line={ this.translate( 'Would you like to start one?' ) }
				action={ this.translate( 'Create Site' ) }
				actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
				illustration={ '/calypso/images/drake/drake-nosites.svg' } />
		}

		const renderBlog = ( site, index, disableToggle = false ) => {
			return (
				<Blog
					key={ `blog-${ site.ID }` }
					siteId={ site.ID }
					devices={ this.props.devices }
					disableToggle={ disableToggle }
					hasUnsavedChanges={ this.props.hasUnsavedChanges }
					settings={ this.props.settings.find( settings => settings.get( 'blog_id' ) === site.ID ) }
					onToggle={ this.props.onToggle }
					onSave={ () => this.props.onSave( site.ID ) }
					onSaveToAll={ () => this.props.onSaveToAll( site.ID ) } />
			);
		}

		if ( sites.length === 1 ) {
			return renderBlog( sites[ 0 ], null, true );
		}

		return (
			<InfiniteList
				items={ sites }
				lastPage={ true }
				fetchNextPage={ () => {} }
				fetchingNextPage={ false }
				guessedItemHeight={ 69 }
				getItemRef={ site => `blog-${ site.ID }` }
				renderItem={ renderBlog }
				renderLoadingPlaceholders={ () => <Placeholder /> } />
		);
	}
} );

const mapStateToProps = state => ( {
	sites: getSites( state )
} );

export default connect( mapStateToProps )( BlogsSettings );
