/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { getStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';
import Emojify from 'calypso/components/emojify';

class ReaderSiteStreamLink extends React.Component {
	static propTypes = {
		feedId: PropTypes.number,
		siteId: PropTypes.number,
		post: PropTypes.object, // for stats only
	};

	recordClick = () => {
		recordAction( 'visit_blog_feed' );
		recordGaEvent( 'Clicked Feed Link' );
		if ( this.props.post ) {
			recordTrackForPost( 'calypso_reader_feed_link_clicked', this.props.post );
		}
	};

	render() {
		// If we can't make a link, just return children
		if ( ! this.props.feedId && ! this.props.siteId ) {
			return (
				<span>
					<Emojify>{ this.props.children }</Emojify>
				</span>
			);
		}

		const link = getStreamUrl( this.props.feedId, this.props.siteId );
		const omitProps = [ 'feedId', 'siteId', 'post' ];

		return (
			<a { ...omit( this.props, omitProps ) } href={ link } onClick={ this.recordClick }>
				<Emojify>{ this.props.children }</Emojify>
			</a>
		);
	}
}

export default ReaderSiteStreamLink;
