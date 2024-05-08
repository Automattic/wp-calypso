import page from '@automattic/calypso-router';
import { SegmentedControl } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FollowButton from 'calypso/blocks/follow-button/button';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import { addQueryArgs } from 'calypso/lib/url';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import { recordAction } from 'calypso/reader/stats';

const updateQueryArg = ( params ) =>
	page.replace( addQueryArgs( params, window.location.pathname + window.location.search ) );

class TagStreamHeader extends Component {
	static propTypes = {
		isPlaceholder: PropTypes.bool,
		showFollow: PropTypes.bool,
		following: PropTypes.bool,
		onFollowToggle: PropTypes.func,
		showBack: PropTypes.bool,
		showSort: PropTypes.bool,
		sort: PropTypes.string,
	};

	useRelevanceSort = () => {
		const sort = 'relevance';
		recordAction( 'tag_page_clicked_relevance_sort' );
		if ( this.props.recordReaderTracksEvent ) {
			this.props.recordReaderTracksEvent( 'calypso_reader_clicked_tag_sort', {
				tag: this.props.encodedTagSlug,
				sort,
			} );
		}
		updateQueryArg( { sort } );
	};

	useDateSort = () => {
		const sort = 'date';
		recordAction( 'tag_page_clicked_date_sort' );
		if ( this.props.recordReaderTracksEvent ) {
			this.props.recordReaderTracksEvent( 'calypso_reader_clicked_tag_sort', {
				tag: this.props.encodedTagSlug,
				sort,
			} );
		}
		updateQueryArg( { sort } );
	};

	render() {
		const {
			title,
			description,
			isPlaceholder,
			showFollow,
			following,
			onFollowToggle,
			showBack,
			showSort,
			translate,
		} = this.props;
		const sortOrder = this.props.sort || 'date';

		// A bit of a hack: check for a prompt tag (which always have a description) from the slug before waiting for tag info to load,
		// so we can set a smaller title size and prevent it from resizing as the page loads. Should be refactored if tag descriptions
		// end up getting used for other things besides prompt tags.
		const isPromptTag = new RegExp( /^dailyprompt-\d+$/ ).test( title );

		// Display the tag description as the title if there is one.
		const titleText = description ?? title;
		const subtitleText = description ? title : null;

		const classes = clsx( {
			'tag-stream__header': true,
			'is-placeholder': isPlaceholder,
			'has-description': isPromptTag || description,
			'has-back-button': showBack,
		} );

		return (
			<div className={ classes }>
				<BloganuaryHeader />
				<NavigationHeader title={ titleText } subtitle={ subtitleText } />
				{ ( showSort || showFollow ) && (
					<div className="tag-stream__header-controls">
						<div className="tag-stream__header-sort-picker">
							{ showSort && (
								<SegmentedControl compact>
									<SegmentedControl.Item
										selected={ sortOrder !== 'relevance' }
										onClick={ this.useDateSort }
									>
										{ translate( 'Recent' ) }
									</SegmentedControl.Item>
									<SegmentedControl.Item
										selected={ sortOrder === 'relevance' }
										onClick={ this.useRelevanceSort }
									>
										{ translate( 'Popular' ) }
									</SegmentedControl.Item>
								</SegmentedControl>
							) }
						</div>
						<div className="tag-stream__header-follow">
							{ showFollow && (
								<FollowButton
									followLabel={ translate( 'Follow tag' ) }
									followingLabel={ translate( 'Following tag' ) }
									iconSize={ 24 }
									following={ following }
									onFollowToggle={ onFollowToggle }
									followIcon={ ReaderFollowFeedIcon( { iconSize: 20 } ) }
									followingIcon={ ReaderFollowingFeedIcon( { iconSize: 20 } ) }
								/>
							) }
						</div>
					</div>
				) }
			</div>
		);
	}
}

export default connect( null, null )( localize( TagStreamHeader ) );
