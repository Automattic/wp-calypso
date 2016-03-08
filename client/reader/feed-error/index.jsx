/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import MobileBackToSidebar from 'components/mobile-back-to-sidebar';
import EmptyContent from 'components/empty-content';
import i18n from 'lib/mixins/i18n';
import { recordAction, recordGaEvent } from 'reader/stats';

const FeedError = React.createClass( {
	recordAction() {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
	},

	recordSecondaryAction() {
		recordAction( 'clicked_recommendations_on_empty' );
		recordGaEvent( 'Clicked Recommendations on EmptyContent' );
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
			<Main>
				<MobileBackToSidebar>
					<h1>{ this.props.sidebarTitle }</h1>
				</MobileBackToSidebar>

				<EmptyContent
					action={ action }
					secondaryAction={ secondaryAction }
					title={ i18n.translate( 'Sorry, we can\'t find that stream.' ) }
					illustration={ '/calypso/images/drake/drake-404.svg' }
					illustrationWidth={ 500 }
				/>
			</Main>
		);
	}
} );

FeedError.propTypes = {
	sidebarTitle: React.PropTypes.string
};

export default FeedError;
