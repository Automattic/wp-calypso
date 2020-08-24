/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, noop } from 'lodash';

/**
 * Internal dependencies
 */
import getSites from 'state/selectors/get-sites';
import { isRequestingSites } from 'state/sites/selectors';
import EmptyContentComponent from 'components/empty-content';
import Blog from './blog';
import InfiniteList from 'components/infinite-list';
import Placeholder from './placeholder';
import config from 'config';

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
		const { sites, requestingSites, translate } = this.props;

		if ( ! sites || ! this.props.settings ) {
			return <Placeholder />;
		}

		if ( sites.length === 0 && ! requestingSites ) {
			return (
				<EmptyContentComponent
					title={ translate( "You don't have any WordPress sites yet." ) }
					line={ translate( 'Would you like to start one?' ) }
					action={ translate( 'Create Site' ) }
					actionURL={ config( 'signup_url' ) + '?ref=calypso-nosites' }
					illustration={ '/calypso/images/illustrations/illustration-nosites.svg' }
				/>
			);
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

export default connect( mapStateToProps )( localize( BlogsSettings ) );
