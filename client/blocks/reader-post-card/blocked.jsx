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
import { unblockSite } from 'calypso/state/reader/site-blocks/actions';
import { Card } from '@automattic/components';
import { recordTrack as recordReaderTrack } from 'calypso/reader/stats';
import { bumpStat, recordGoogleEvent } from 'calypso/state/analytics/actions';

class PostBlocked extends React.Component {
	static propTypes = {
		post: PropTypes.object,
	};

	unblock = () => {
		this.props.bumpStat( 'reader_actions', 'unblocked_blog' );
		this.props.recordGoogleEvent( 'reader_actions', 'Clicked Unblock Site' );
		recordReaderTrack( 'calypso_reader_unblock_site', {
			blog_id: this.props.post.site_ID,
		} );
		this.props.unblockSite( this.props.post.site_ID );
	};

	render() {
		const { post, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<Card className="reader-post-card is-blocked">
				<p className="reader-post-card__blocked-description">
					{ translate( 'You have blocked %(site_name)s.', {
						args: { site_name: post.site_name },
					} ) }
					<button onClick={ this.unblock } className="reader-post-card__blocked-undo">
						{ translate( 'Undo?' ) }
					</button>
				</p>
			</Card>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordGoogleEvent,
	bumpStat,
	unblockSite,
} )( localize( PostBlocked ) );
