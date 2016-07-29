/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { getStreamUrl } from 'reader/route';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';

const ReaderSiteStreamLink = React.createClass( {
	propTypes: {
		feedId: React.PropTypes.number,
		siteId: React.PropTypes.number
	},

	recordClick() {
		recordAction( 'visit_blog_feed' );
		recordGaEvent( 'Clicked Feed Link' );
		recordTrack( 'calypso_reader_feed_link_clicked' );
	},

	render() {
		const link = getStreamUrl( this.props.feedId, this.props.siteId );

		return (
			<a { ...this.props } href={ link } onClick={ this.recordClick }>{ this.props.children }</a>
		);
	}

} );

export default ReaderSiteStreamLink;
