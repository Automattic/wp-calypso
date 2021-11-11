import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PlaceholderImage from 'calypso/assets/images/marketplace/plugins-revamp.png';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import Button from 'calypso/components/forms/form-button';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

const AnnouncementModalExample = () => {
	const announcementId = 'announcement-modal-example';
	const [ show, setShow ] = useState( false );
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `announcement-modal-${ announcementId }-${ userId }`;

	if ( ! hasPreferences ) {
		return null;
	}

	const pages = [
		{
			heading: 'All the plugins and more',
			content:
				'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!',
			featureImage: PlaceholderImage,
		},
	];

	const TriggerButton = () => (
		<Button onClick={ () => dispatch( savePreference( dismissPreference, 0 ) ) && setShow( true ) }>
			Show
		</Button>
	);

	if ( show ) {
		return (
			<>
				{ TriggerButton() }
				<AnnouncementModal
					announcementId={ announcementId }
					pages={ pages }
					finishButtonText="Close"
				/>
			</>
		);
	}

	return TriggerButton();
};

AnnouncementModalExample.displayName = 'AnnouncementModal';

export default AnnouncementModalExample;
