/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { isDiscoverEnabled } from 'reader/discover/helper';
import QueryReaderList from 'components/data/query-reader-list';

const stats = require( 'reader/stats' );

const ListMissing = React.createClass( {

	propTypes: {
		owner: React.PropTypes.string.isRequired,
		slug: React.PropTypes.string.isRequired
	},

	recordAction() {
		stats.recordAction( 'clicked_following_on_empty' );
		stats.recordGaEvent( 'Clicked Following on EmptyContent' );
		stats.recordTrack( 'calypso_reader_following_on_missing_list_clicked' );
	},

	recordSecondaryAction() {
		stats.recordAction( 'clicked_discover_on_empty' );
		stats.recordGaEvent( 'Clicked Discover on EmptyContent' );
		stats.recordTrack( 'calypso_reader_discover_on_missing_list_clicked' );
	},

	render() {
		const action = ( <a
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="/">{ this.translate( 'Back to Followed Sites' ) }</a> ),
			secondaryAction = isDiscoverEnabled()
			? ( <a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		return (
			<div>
				<QueryReaderList owner={ this.props.owner } slug={ this.props.slug } />
				<EmptyContent
				title={ this.translate( 'List not found' ) }
				line={ this.translate( 'Sorry, we couldn\'t find that list.' ) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/drake/drake-empty-results.svg' }
				illustrationWidth={ 500 }
				/>
			</div>
		);
	}
} );

export default ListMissing
;
