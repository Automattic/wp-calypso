import { Component } from 'react';
import {
	recordAction,
	recordGaEvent,
	recordTrackForPost,
} from 'calypso/reader/stats';

class TagLink extends Component {
	recordSingleTagClick = () => {
		const tag = this.props.tag;
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		recordTrackForPost( 'calypso_reader_tag_clicked', this.props.post, {
			tag: tag.slug,
		} );
	};

	render() {
		const tag = this.props.tag;
		return (
			<span className="reader-post-card__tag">
				<a
					href={ '/tag/' + tag.slug }
					className="reader-post-card__tag-link ignore-click"
					onClick={ this.recordSingleTagClick }
				>
					{ tag.name }
				</a>
			</span>
		);
	}
}

export default TagLink;
