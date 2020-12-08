/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import { isDiscoverEnabled } from 'calypso/reader/discover/helper';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import { recordAction, recordGaEvent, recordTrack } from 'calypso/reader/stats';

class ListMissing extends React.Component {
	static propTypes = {
		owner: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired,
	};

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		recordTrack( 'calypso_reader_following_on_missing_list_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_missing_list_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read"
			>
				{ this.props.translate( 'Back to Followed Sites' ) }
			</a>
		);
		const secondaryAction = isDiscoverEnabled() ? (
			<a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore' ) }
			</a>
		) : null;

		return (
			<div>
				<QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />
				<EmptyContent
					title={ this.props.translate( 'List not found' ) }
					line={ this.props.translate( "Sorry, we couldn't find that list." ) }
					action={ action }
					secondaryAction={ secondaryAction }
					illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					illustrationWidth={ 500 }
				/>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default localize( ListMissing );
