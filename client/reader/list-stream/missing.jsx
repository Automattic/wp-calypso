/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from 'calypso/components/empty-content';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class ListMissing extends React.Component {
	static propTypes = {
		owner: PropTypes.string.isRequired,
		slug: PropTypes.string.isRequired,
	};

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_following_on_missing_list_clicked' );
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

		return (
			<div>
				<QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />
				<EmptyContent
					title={ this.props.translate( 'List not found' ) }
					line={ this.props.translate( "Sorry, we couldn't find that list." ) }
					action={ action }
					illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
					illustrationWidth={ 500 }
				/>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ListMissing ) );
