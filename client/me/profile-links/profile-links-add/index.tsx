import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { AddProfileLinksPayload } from '../data/types';
import { useAddProfileLinkMutation } from '../data/use-add-profile-link-mutation';
import ProfileLinksAddOther from './add-other';
import ProfileLinksAddWordPress from './add-wordpress';

export type ShowingForm = 'wordpress' | 'other';

type ProfileLinksAddProps = {
	onSuccess: () => void;
	onCancel: () => void;
	showingForm?: ShowingForm;
};

const NOTICE_DURATION = 1000 * 5;
const createNoticeId = ( linkSlug: string ) => `profile-links-${ linkSlug }`;

function ProfileLinksAdd( { showingForm, onSuccess, onCancel }: ProfileLinksAddProps ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const { addProfileLinksAsync, isLoading: isAddingProfileLinks } = useAddProfileLinkMutation( {
		onSuccess: ( data ) => {
			if ( data.duplicate ) {
				data.duplicate.forEach( ( duplicateLink ) => {
					dispatch(
						errorNotice(
							translate( '%s is already in your profile links.', {
								args: [ duplicateLink.value ],
							} ),
							{ id: createNoticeId( duplicateLink.link_slug ), duration: NOTICE_DURATION }
						)
					);
				} );
			}

			if ( data.malformed ) {
				data.malformed.forEach( ( malformedLink ) => {
					dispatch(
						errorNotice(
							translate(
								'An unexpected error occurred while adding %s to your profile links. Please try again later.',
								{ args: [ malformedLink.value ] }
							),
							{ id: createNoticeId( malformedLink.link_slug ), duration: NOTICE_DURATION }
						)
					);
				} );
			}

			if ( data.added ) {
				data.added.forEach( ( addedLink ) => {
					dispatch(
						successNotice(
							translate( 'Added %s to your profile links successfully.', {
								args: [ addedLink.value ],
							} ),
							{ id: createNoticeId( addedLink.link_slug ), duration: NOTICE_DURATION }
						)
					);
				} );
			}
		},
		onError: () => {
			dispatch(
				errorNotice( 'An unexpected error occurred. Please try again later.', {
					id: `profile-links-general-error`,
				} )
			);
		},
	} );

	const addUserProfileLinks = useCallback(
		async ( links: AddProfileLinksPayload ) => {
			await addProfileLinksAsync( links );
			onSuccess?.();
		},
		[ addProfileLinksAsync, onSuccess ]
	);

	if ( 'wordpress' === showingForm ) {
		return (
			<ProfileLinksAddWordPress
				onCancel={ onCancel }
				addUserProfileLinks={ addUserProfileLinks }
				isAddingProfileLinks={ isAddingProfileLinks }
			/>
		);
	}

	return (
		<ProfileLinksAddOther
			onCancel={ onCancel }
			addUserProfileLinks={ addUserProfileLinks }
			isAddingProfileLinks={ isAddingProfileLinks }
		/>
	);
}

export default ProfileLinksAdd;
