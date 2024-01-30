import { useLayoutEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PlaceholderImage from 'calypso/assets/images/marketplace/diamond.svg';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import Button from 'calypso/components/forms/form-button';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { setPreference } from 'calypso/state/preferences/actions';

const AnnouncementModalExample = () => {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const announcementId = 'example';
	const dismissPreference = `announcement-modal-${ announcementId }-${ userId }`;

	useLayoutEffect( () => {
		// Initially hide for users visiting devdocs.
		dispatch( setPreference( dismissPreference, 1 ) );
	}, [] );

	const pages = [
		{
			heading: 'All the plugins and more',
			content:
				'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!',
			featureImage: PlaceholderImage,
		},
	];

	return (
		<>
			<Button
				onClick={ () => setTimeout( () => dispatch( setPreference( dismissPreference, 0 ) ), 200 ) }
			>
				Show
			</Button>
			<AnnouncementModal
				announcementId={ announcementId }
				pages={ pages }
				finishButtonText="Close"
			/>
		</>
	);
};

AnnouncementModalExample.displayName = 'AnnouncementModal';

export default AnnouncementModalExample;
