/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { isDiscoverEnabled } from 'reader/discover/helper';
import { recordAction as statRecordAction, recordGaEvent, recordTrack } from 'reader/stats';

const SiteEmptyContent = ( { translate } ) => {
	const recordAction = () => {
		statRecordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_site_stream_clicked' );
	};

	const recordSecondaryAction = () => {
		statRecordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_site_stream_clicked' );
	};

	let action;

	if ( isDiscoverEnabled() ) {
		action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ recordAction }
				href="/discover"
			>
				{ translate( 'Explore Discover' ) }
			</a>
		);
	}

	const secondaryAction = (
		<a
			className="empty-content__action button"
			onClick={ recordSecondaryAction }
			href="/read/search"
		>
			{ translate( 'Find Sites to Follow' ) }
		</a>
	);

	return (
		<EmptyContent
			title={ translate( 'No Posts' ) }
			line={ translate( 'This site has not posted anything yet. Try back later.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
			illustrationWidth={ 500 }
		/>
	);
};

export default localize( SiteEmptyContent );
