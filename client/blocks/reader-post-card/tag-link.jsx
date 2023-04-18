import { Component } from 'react';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';

class TagLink extends Component {
	recordSingleTagClick = () => {
		const { tag, post } = this.props;
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		if ( post !== undefined ) {
			recordTrackForPost( 'calypso_reader_tag_clicked', post, {
				tag: tag.slug,
			} );
		}
	};

	render() {
		const { tag } = this.props;
		return (
			<span className="reader-post-card__tag">
				<a
					href={ '/tag/' + tag.slug }
					className="reader-post-card__tag-link ignore-click"
					onClick={ this.recordSingleTagClick }
				>
					{ tag.name || tag.display_name }
				</a>
			</span>
		);
	}
}

export default TagLink;
