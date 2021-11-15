import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PlaceholderImage from 'calypso/assets/images/marketplace/plugins-revamp.png';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import Button from 'calypso/components/forms/form-button';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

const AnnouncementModalExample = () => {
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const announcementId = 'example';
	const dismissPreference = `announcement-modal-${ announcementId }-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const [ show, setShow ] = useState( false );

	useEffect( () => {
		if ( ! hasPreferences ) {
			return;
		}

		if ( isDismissed ) {
			// Override the dismissing mechanism of the AnnouncementModal and just utilize useState here.
			dispatch( savePreference( dismissPreference, 0 ) );
			setShow( false );
		}
	}, [ isDismissed, hasPreferences, dismissPreference, dispatch ] );

	const pages = [
		{
			heading: 'All the plugins and more',
			content:
				'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!',
			featureImage: PlaceholderImage,
		},
	];

	const TriggerButton = () => <Button onClick={ () => setShow( true ) }>Show</Button>;
	return (
		<>
			<TriggerButton />
			{ show && (
				<AnnouncementModal
					announcementId={ announcementId }
					pages={ pages }
					finishButtonText="Close"
				/>
			) }
		</>
	);
};

AnnouncementModalExample.displayName = 'AnnouncementModal';

export default AnnouncementModalExample;
