/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import * as stats from 'reader/stats';
import * as DiscoverHelper from 'reader/discover/helper';

const SiteEmptyContent = ( { translate } ) => {
	const recordAction = () => {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
		stats.recordTrack( 'calypso_reader_discover_on_empty_site_stream_clicked' );
	};

	const recordSecondaryAction = () => {
		stats.recordAction( 'clicked_search_on_empty' );
		stats.recordGaEvent( 'Clicked Search on EmptyContent' );
		stats.recordTrack( 'calypso_reader_search_on_empty_site_stream_clicked' );
	};

	let action;

	if ( DiscoverHelper.isDiscoverEnabled() ) {
		action = (
			<a className="empty-content__action button is-primary"
				onClick={ recordAction }
				href="/discover">{ translate( 'Explore Discover' ) }</a> );
	}

	const secondaryAction = (
		<a className="empty-content__action button"
			onClick={ recordSecondaryAction }
			href="/read/search">{ translate( 'Find Sites to Follow' ) }</a> );

	return ( <EmptyContent
			title={ translate( 'No Posts' ) }
			line={ translate( 'This site has not posted anything yet. Try back later.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
};

export default localize( SiteEmptyContent );
