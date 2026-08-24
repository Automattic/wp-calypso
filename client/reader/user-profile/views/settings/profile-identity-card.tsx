import { userQuery, userSettingsQuery, userSettingsMutation } from '@automattic/api-queries';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
	Card,
	CardHeader,
	CardBody,
	TextControl,
	TextareaControl,
	Button,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import EditGravatar from 'calypso/blocks/edit-gravatar';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { useRecordReaderTracksEvent } from 'calypso/state/reader/analytics/useRecordReaderTracksEvent';
import type { ReaderUser } from '@automattic/api-core';

interface ProfileIdentityCardProps {
	user: ReaderUser;
}

export default function ProfileIdentityCard( { user }: ProfileIdentityCardProps ): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const recordReaderTracksEvent = useRecordReaderTracksEvent();

	const { data: settings } = useQuery( userSettingsQuery() );
	const { mutate: saveSettings, isPending } = useMutation( userSettingsMutation() );

	const [ displayName, setDisplayName ] = useState( '' );
	const [ description, setDescription ] = useState( '' );

	// Pre-fill from `/me/settings` (the writable source of truth) once it loads.
	useEffect( () => {
		if ( settings ) {
			setDisplayName( settings.display_name ?? '' );
			setDescription( settings.description ?? '' );
		}
	}, [ settings ] );

	const isDirty = displayName !== settings?.display_name || description !== settings?.description;

	const refreshProfileHeader = () => {
		// The profile header reads identity from `userQuery`, a different cache entry than
		// `/me/settings`. Invalidate it so the header reflects the new name/bio.
		queryClient.invalidateQueries( { queryKey: userQuery( user.user_login ).queryKey } );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		if ( ! isDirty ) {
			return;
		}
		saveSettings(
			{ display_name: displayName, description },
			{
				onSuccess() {
					// Mirror into the active Calypso QueryClient (the mutation patches the
					// `@automattic/api-queries` singleton, not this surface's client).
					queryClient.setQueryData( userSettingsQuery().queryKey, ( oldData ) =>
						oldData ? { ...oldData, display_name: displayName, description } : oldData
					);
					refreshProfileHeader();
					dispatch(
						successNotice( translate( 'Your profile has been updated.' ), { duration: 4000 } )
					);
					recordReaderTracksEvent( 'calypso_reader_profile_settings_identity_saved' );
				},
				onError() {
					dispatch(
						errorNotice( translate( 'Failed to update your profile.' ), { duration: 4000 } )
					);
				},
			}
		);
	};

	return (
		<Card>
			<CardHeader>
				<h2 className="user-profile-settings__card-title">{ translate( 'Profile' ) }</h2>
			</CardHeader>
			<CardBody>
				<form onSubmit={ handleSubmit }>
					<VStack spacing={ 4 }>
						<EditGravatar onAvatarUpdated={ refreshProfileHeader } />
						<TextControl
							__nextHasNoMarginBottom
							label={ translate( 'Display name' ) }
							value={ displayName }
							onChange={ setDisplayName }
						/>
						<TextareaControl
							__nextHasNoMarginBottom
							label={ translate( 'About' ) }
							help={ translate( 'A short bio shown on your public profile.' ) }
							value={ description }
							onChange={ setDescription }
						/>
						<div>
							<Button
								variant="primary"
								type="submit"
								isBusy={ isPending }
								disabled={ isPending || ! isDirty }
							>
								{ translate( 'Save' ) }
							</Button>
						</div>
					</VStack>
				</form>
			</CardBody>
		</Card>
	);
}
