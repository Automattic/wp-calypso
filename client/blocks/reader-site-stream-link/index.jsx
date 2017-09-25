/** @format */
/**
 * External dependencies
 */
import { omit } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Emojify from 'components/emojify';
import { getStreamUrl } from 'reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

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
