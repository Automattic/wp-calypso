/**
 * External dependencies
 */
import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

const FollowingEditEmptyContent = React.createClass( {
	componentDidMount() {
		recordTrack( 'calypso_reader_empty_manage_following_loaded' );
	},

	recordAction() {
		recordAction( 'clicked_discover_on_empty_manage_following' );
		recordGaEvent( 'Clicked Discover on EmptyContent in Manage Following' );
		recordTrack( 'calypso_reader_discover_on_empty_manage_following_clicked' );
	},

	recordSecondaryAction() {
		recordAction( 'clicked_recommendations_on_empty_manage_following' );
		recordGaEvent( 'Clicked Recommendations on EmptyContent in Manage Following' );
		recordTrack( 'calypso_reader_recommendations_on_empty_manage_following_clicked' );
	},

	render() {
		const action = ( <a className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/discover">{ this.translate( 'Explore Discover' ) }</a> ),
			secondaryAction = (
				<a className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/recommendations">{ this.translate( 'Get recommendations on who to follow' ) }</a> );

		return (
			<EmptyContent
				action={ action }
				secondaryAction={ secondaryAction }
				title={ i18n.translate( 'You haven\'t followed any sites yet' ) }
				line={ i18n.translate( 'Search for a site above or get recommendations.' ) }
				illustration={ '/calypso/images/drake/drake-404.svg' }
				illustrationWidth={ 500 }
			/>
		);
	}
} );

export default FollowingEditEmptyContent;
