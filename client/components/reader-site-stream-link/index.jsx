/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getStreamUrlFromPost } from 'reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderSiteStreamLink = React.createClass( {
	propTypes: {
		post: React.PropTypes.object.isRequired
	},

	recordClick() {
		recordAction( 'visit_blog_feed' );
		recordGaEvent( 'Clicked Feed Link' );
		recordTrackForPost( 'calypso_reader_feed_link_clicked', this.props.post );
	},

	render() {
		const link = getStreamUrlFromPost( this.props.post );

		return (
			<a { ...this.props } href={ link } onClick={ this.recordClick }>{ this.props.children }</a>
		);
	}

} );

export default ReaderSiteStreamLink;
