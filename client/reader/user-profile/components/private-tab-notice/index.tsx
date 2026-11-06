import './style.scss';
import { UserPreferences } from '@automattic/api-core';
import { userPreferenceQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { speak } from '@wordpress/a11y';
import { Notice } from '@wordpress/ui';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';

interface UserProfilePrivateTabNoticeProps {
	title: string;
	tab: 'achievements' | 'posts' | 'sites';
	userPreferencesKey: keyof UserPreferences;
}

export default function UserProfilePrivateTabNotice( {
	title,
	tab,
	userPreferencesKey,
}: UserProfilePrivateTabNoticeProps ): JSX.Element | null {
	const translate = useTranslate();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: savedVisibility } = useQuery( userPreferenceQuery( userPreferencesKey ) );
	const isPrivate = savedVisibility !== 'public';

	const description = translate( 'Only you can see them. Make them public from the Settings tab.' );

	useEffect( () => {
		if ( isPrivate ) {
			recordReaderTracksEvent( 'calypso_reader_profile_private_tab_notice_displayed', { tab } );
		}
	}, [ isPrivate, recordReaderTracksEvent, tab ] );

	// @wordpress/ui's Notice doesn't announce itself.
	useEffect( () => {
		if ( isPrivate ) {
			speak( `${ title } ${ description }`, 'polite' );
		}
	}, [ isPrivate, title, description ] );

	if ( ! isPrivate ) {
		return null;
	}

	return (
		<div className="user-profile__private-tab-notice">
			<Notice.Root intent="info">
				<Notice.Title>{ title }</Notice.Title>
				<Notice.Description>{ description }</Notice.Description>
			</Notice.Root>
		</div>
	);
}
