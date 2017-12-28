/** @format */
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
import { unblockSite } from 'client/state/reader/site-blocks/actions';
import Card from 'client/components/card';
import { recordTrack as recordReaderTrack } from 'client/reader/stats';
import { bumpStat, recordGoogleEvent } from 'client/state/analytics/actions';

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

		return (
			<Card className="reader-post-card is-blocked">
				<p className="reader-post-card__blocked-description">
					{ translate( 'You have blocked %(site_name)s.', {
						args: { site_name: post.site_name },
					} ) }
					<a onClick={ this.unblock } className="reader-post-card__blocked-undo">
						{ translate( 'Undo?' ) }
					</a>
				</p>
			</Card>
		);
	}
}

export default connect( null, {
	recordGoogleEvent,
	bumpStat,
	unblockSite,
} )( localize( PostBlocked ) );
