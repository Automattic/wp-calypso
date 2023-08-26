import { addLocaleToPathLocaleInFront } from '@automattic/i18n-utils';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { recordAction, recordGaEvent, recordTrackForPost } from 'calypso/reader/stats';

const noop = () => {};

class TagLink extends Component {
	static propTypes = {
		tag: PropTypes.object.isRequired,
		post: PropTypes.object,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		tag: '',
		onClick: noop,
	};

	recordSingleTagClick = () => {
		const { tag, post } = this.props;
		recordAction( 'click_tag' );
		recordGaEvent( 'Clicked Tag Link' );
		if ( post !== undefined ) {
			recordTrackForPost( 'calypso_reader_tag_clicked', post, {
				tag: tag.slug,
			} );
		}
		this.props.onClick( tag );
	};

	render() {
		const { tag } = this.props;
		const path = addLocaleToPathLocaleInFront( `/tag/${ encodeURIComponent( tag.slug ) }` );

		return (
			<span className="reader-post-card__tag">
				<a
					href={ path }
					className="reader-post-card__tag-link ignore-click"
					onClick={ this.recordSingleTagClick }
				>
					{ tag.name || tag.slug }
				</a>
			</span>
		);
	}
}

export default TagLink;
