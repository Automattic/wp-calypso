/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import * as stats from 'reader/stats';
import SiteBlockActions from 'lib/reader-site-blocks/actions';
import Card from 'components/card';
import Button from 'components/button';

class PostBlocked extends React.PureComponent {

	static propTypes = {
		post: React.PropTypes.object,
	};

	unblock = () => {
		analytics.mc.bumpStat( 'reader_actions', 'unblocked_blog' );
		analytics.ga.recordEvent( 'reader_actions', 'Clicked Unblock Site' );
		stats.recordTrack( 'calypso_reader_unblock_site', {
			blog_id: this.props.post.site_ID,
		} );
		SiteBlockActions.unblock( this.props.post.site_ID );
	}

	render() {
		const { post } = this.props;

		return (
			<Card className="reader-post-card is-blocked">
				<p className="reader-post-card__blocked-description">
					{ this.props.translate( 'You have blocked all posts from %(site_name)s.', { args: { site_name: post.site_name } } ) }
					<Button compact primary className="reader-post-card__blocked-button" onClick={ this.unblock }>
						{ this.props.translate( 'Unblock' ) }
					</Button>
				</p>
			</Card>
		);
	}
}

export default localize( PostBlocked );
