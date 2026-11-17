import { Icon } from '@wordpress/components';
import { share } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { useDispatch } from 'calypso/state';
import { errorNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import type { TrackPostData } from 'calypso/state/reader/analytics/types';
import type { MouseEventHandler } from 'react';

interface NativeShareMenuItemProps {
	post: TrackPostData & { URL?: string; title?: string };
	onClick?: MouseEventHandler< HTMLButtonElement >;
}

export function NativeShareMenuItem( { post, onClick }: NativeShareMenuItemProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const shareData = { title: post.title, url: post.URL };

	if (
		typeof navigator === 'undefined' ||
		typeof navigator.share !== 'function' ||
		! post.URL ||
		( navigator.canShare && ! navigator.canShare( shareData ) )
	) {
		return null;
	}

	const sharePost: MouseEventHandler< HTMLButtonElement > = async ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		onClick?.( event );
		dispatch(
			recordReaderTracksEvent(
				'calypso_reader_share_action_picked',
				{ action: 'native' },
				{ post }
			)
		);

		try {
			await navigator.share( shareData );
		} catch ( error ) {
			if ( error instanceof Error && error.name === 'AbortError' ) {
				return;
			}
			dispatch( errorNotice( translate( 'Unable to share this post. Please try again.' ) ) );
		}
	};

	return (
		<PopoverMenuItem onClick={ sharePost } icon={ <Icon icon={ share } size={ 24 } /> }>
			{ translate( 'Share via device' ) }
		</PopoverMenuItem>
	);
}
