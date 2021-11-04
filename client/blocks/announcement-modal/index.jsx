import { Title } from '@automattic/onboarding';
import { Guide } from '@wordpress/components';
import { useSelector, useDispatch } from 'react-redux';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

import './style.scss';

const Page = ( { heading, content, image } ) => {
	return (
		<div className="announcement-modal__page">
			<div className="announcement-modal__text">
				<div className="announcement-modal__heading">
					<Title tagName="h2">{ heading }</Title>
				</div>
				<div className="announcement-modal__description">
					<p>{ content }</p>
				</div>
			</div>
			<div className="announcement-modal__visual">{ image }</div>
		</div>
	);
};

const Modal = ( { announcementId, pages } ) => {
	const dispatch = useDispatch();
	const userId = useSelector( ( state ) => getCurrentUserId( state ) );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `announcement-modal-${ userId }-${ announcementId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );

	if ( ! hasPreferences || isDismissed ) {
		return null;
	}

	const handleDismiss = () => {
		dispatch( savePreference( dismissPreference, 1 ) );
	};

	return (
		<Guide
			className="announcement-modal"
			onFinish={ handleDismiss }
			pages={ pages.map( ( page ) => ( {
				content: (
					<Page
						image={
							<picture
								className="announcement-modal__picture announcement-modal__picture--bottom-left"
								key={ page.featureImage }
							>
								<source srcSet={ page.featureImage } media="(min-width: 600px)" />
								<img alt="" src={ page.featureImage } />
							</picture>
						}
						heading={ page.heading }
						content={ page.content }
					/>
				),
			} ) ) }
		/>
	);
};

export default Modal;
