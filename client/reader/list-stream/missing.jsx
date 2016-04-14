import React from 'react';

import EmptyContent from 'components/empty-content';
import discoverHelper from 'reader/discover/helper';

const stats = require( 'reader/stats' );

const ListEmptyContent = React.createClass( {
	shouldComponentUpdate() {
		return false;
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
		var action = ( <a
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="/">{ this.translate( 'Back to Following' ) }</a> ),
			secondaryAction = discoverHelper.isEnabled()
			? ( <a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		return ( <EmptyContent
			title={ this.translate( 'List not found' ) }
			line={ this.translate( 'Sorry, we couldn\'t find that list.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

export default ListEmptyContent;
