/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteUnblock } from 'state/reader/site-blocks/actions';
import Card from 'components/card';
import { recordTrack as recordReaderTrack } from 'reader/stats';
import {
	bumpStat,
	recordGoogleEvent,
} from 'state/analytics/actions';

class PostBlocked extends React.Component {

	static propTypes = {
		post: React.PropTypes.object,
	};

	unblock = () => {
		this.props.bumpStat( 'reader_actions', 'unblocked_blog' );
		this.props.recordGoogleEvent( 'reader_actions', 'Clicked Unblock Site' );
		recordReaderTrack( 'calypso_reader_unblock_site', {
			blog_id: this.props.post.site_ID,
		} );
		this.props.requestSiteUnblock( this.props.post.site_ID );
	}

	render() {
		const { post, translate } = this.props;

		return (
			<Card className="reader-post-card is-blocked">
				<p className="reader-post-card__blocked-description">
					{ translate( 'You have blocked %(site_name)s.', { args: { site_name: post.site_name } } ) }
					<a onClick={ this.unblock } className="reader-post-card__blocked-undo">{ translate( 'Undo?' ) }</a>
				</p>
			</Card>
		);
	}
}

export default connect(
	null,
	{
		recordGoogleEvent,
		bumpStat,
		requestSiteUnblock,
	}
)( localize( PostBlocked ) );
