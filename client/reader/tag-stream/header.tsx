import page from '@automattic/calypso-router';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import FollowButton from 'calypso/blocks/follow-button/button';
import BloganuaryHeader from 'calypso/components/bloganuary-header';
import NavigationHeader from 'calypso/components/navigation-header';
import { addQueryArgs } from 'calypso/lib/url';
import ReaderFollowFeedIcon from 'calypso/reader/components/icons/follow-feed-icon';
import ReaderFollowingFeedIcon from 'calypso/reader/components/icons/following-feed-icon';
import { recordAction } from 'calypso/reader/stats';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

interface TagStreamHeaderProps {
	encodedTagSlug: string;
	description?: string;
	following?: boolean;
	isPlaceholder?: boolean;
	onFollowToggle?: () => void;
	showFollow: boolean;
	showSort: boolean;
	sort?: string;
	title: string;
}

export default function TagStreamHeader( props: TagStreamHeaderProps ): JSX.Element {
	const {
		description,
		encodedTagSlug,
		following,
		isPlaceholder,
		onFollowToggle,
		showFollow,
		showSort,
		sort,
		title,
	} = props;
	const recordReaderTracksEvent = useRecordReaderTracksEvent();
	const translate = useTranslate();
	const sortOrder = sort || 'date';
	// A bit of a hack: check for a prompt tag (which always have a description) from the slug before waiting for tag info to load,
	// so we can set a smaller title size and prevent it from resizing as the page loads. Should be refactored if tag descriptions
	// end up getting used for other things besides prompt tags.
	const isPromptTag = new RegExp( /^dailyprompt-\d+$/ ).test( title );
	// Display the tag description as the title if there is one.
	const titleText = description ?? title;
	const subtitleText = description ? title : null;

	function onChangeSortPicker( sort: string | number | undefined ): void {
		if ( typeof sort !== 'string' ) {
			return;
		}

		switch ( sort ) {
			case 'date':
				recordAction( 'tag_page_clicked_date_sort' );
				break;
			case 'relevance':
				recordAction( 'tag_page_clicked_relevance_sort' );
				break;
		}

		if ( recordReaderTracksEvent ) {
			recordReaderTracksEvent( 'calypso_reader_clicked_tag_sort', {
				tag: encodedTagSlug,
				sort,
			} );
		}

		page.replace( addQueryArgs( { sort }, window.location.pathname + window.location.search ) );
	}

	return (
		<div
			className={ clsx( {
				'tag-stream__header': true,
				'is-placeholder': isPlaceholder,
				'has-description': isPromptTag || description,
			} ) }
		>
			<BloganuaryHeader />
			<NavigationHeader title={ titleText } subtitle={ subtitleText } />
			{ ( showSort || showFollow ) && (
				<div className="tag-stream__header-controls">
					<div className="tag-stream__header-sort-picker">
						{ showSort && (
							<ToggleGroupControl
								hideLabelFromVision
								isBlock
								label="Sort"
								value={ sortOrder }
								onChange={ onChangeSortPicker }
								__nextHasNoMarginBottom
								__next40pxDefaultSize
							>
								<ToggleGroupControlOption label={ translate( 'Recent' ) } value="date" />
								<ToggleGroupControlOption label={ translate( 'Popular' ) } value="relevance" />
							</ToggleGroupControl>
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
