/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { recordAction as statRecordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';
import { isDiscoverEnabled } from 'calypso/reader/discover/helper';

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

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	if ( isDiscoverEnabled() ) {
		action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ recordAction }
				href="/discover"
			>
				{ translate( 'Explore' ) }
			</a>
		);
	}

	const secondaryAction = (
		<a
			className="empty-content__action button"
			onClick={ recordSecondaryAction }
			href="/read/search"
		>
			{ translate( 'Find sites to follow' ) }
		</a>
	);
	/* eslint-enable wpcalypso/jsx-classname-namespace */

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
