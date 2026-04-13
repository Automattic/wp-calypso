import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { successNotice } from 'calypso/state/notices/actions';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { follow } from 'calypso/state/reader/follows/actions';
import { registerLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import type { PublicListItem } from './use-public-list-query';

interface FollowAllSitesButtonProps {
	items: PublicListItem[];
	followSource: string;
}

export function FollowAllSitesButton( { items }: FollowAllSitesButtonProps ): JSX.Element | null {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const isLoggedIn = useSelector( isUserLoggedIn );
	const [ isFollowing, setIsFollowing ] = useState( false );

	if ( ! items || items.length === 0 ) {
		return null;
	}

	async function handleFollowAll() {
		dispatch(
			recordReaderTracksEvent( 'calypso_reader_list_follow_all_clicked', {
				site_count: items.length,
			} )
		);

		if ( ! isLoggedIn ) {
			dispatch(
				registerLastActionRequiresLogin( {
					type: 'follow-site',
					siteUrl: items[ 0 ].site_url,
				} )
			);
			return;
		}

		setIsFollowing( true );

		for ( const item of items ) {
			dispatch( follow( item.site_url ) );
		}

		dispatch(
			recordReaderTracksEvent( 'calypso_reader_list_follow_all_completed', {
				site_count: items.length,
			} )
		);

		dispatch(
			successNotice(
				translate( 'Subscribed to %(count)d sites.', {
					args: { count: items.length },
				} ),
				{ duration: 5000 }
			)
		);

		setIsFollowing( false );
	}

	return (
		<Button
			variant="secondary"
			onClick={ handleFollowAll }
			isBusy={ isFollowing }
			disabled={ isFollowing }
		>
			{ isFollowing ? translate( 'Subscribing\u2026' ) : translate( 'Follow all sites' ) }
		</Button>
	);
}
