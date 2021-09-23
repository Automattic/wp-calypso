import PropTypes from 'prop-types';
import { Component } from 'react';
import { getStreamUrl } from 'calypso/reader/route';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';

class ReaderSiteStreamLink extends Component {
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
		const { feedId, siteId, post, children, ...rest } = this.props;

		// If we can't make a link, just return children
		if ( ! feedId && ! siteId ) {
			return <span>{ children }</span>;
		}

		const link = getStreamUrl( feedId, siteId );

		return (
			<a { ...rest } href={ link } onClick={ this.recordClick }>
				{ children }
			</a>
		);
	}
}

export default ReaderSiteStreamLink;
