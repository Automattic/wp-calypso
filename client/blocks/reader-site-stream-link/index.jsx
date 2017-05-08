/**
 * External dependencies
 */
import React from 'react';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getStreamUrl } from 'reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

const ReaderSiteStreamLink = React.createClass( {
	propTypes: {
		feedId: React.PropTypes.number,
		siteId: React.PropTypes.number,
		post: React.PropTypes.object // for stats only
	},

	recordClick() {
		recordAction( 'visit_blog_feed' );
		recordGaEvent( 'Clicked Feed Link' );
		if ( this.props.post ) {
			recordTrackForPost( 'calypso_reader_feed_link_clicked', this.props.post );
		}
	},

	render() {
		// If we can't make a link, just return children
		if ( ! this.props.feedId && ! this.props.siteId ) {
			return ( <span>{ this.props.children }</span> );
		}

		const link = getStreamUrl( this.props.feedId, this.props.siteId );
		const omitProps = [ 'feedId', 'siteId', 'post' ];

		return (
			<a { ...omit( this.props, omitProps ) } href={ link } onClick={ this.recordClick }>{ this.props.children }</a>
		);
	}

} );

export default ReaderSiteStreamLink;
