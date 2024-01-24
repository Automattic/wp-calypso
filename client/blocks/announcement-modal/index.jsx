import pageRouter from '@automattic/calypso-router';
import { Button } from '@automattic/components';
import { Guide } from '@wordpress/components';
import { useSelector, useDispatch } from 'react-redux';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

import './style.scss';

const Page = ( { headline, heading, content, image, cta, handleClick } ) => {
	return (
		<div className="announcement-modal__page">
			<div className="announcement-modal__text">
				<div className="announcement-modal__headline">
					<span>{ headline }</span>
				</div>
				<div className="announcement-modal__heading">{ preventWidows( heading ) }</div>
				<div className="announcement-modal__description">
					<p>{ preventWidows( content ) }</p>
				</div>
				{ cta && (
					<div className="announcement-modal__cta">
						<Button primary onClick={ handleClick }>
							{ cta }
						</Button>
					</div>
				) }
			</div>
			<div className="announcement-modal__visual">{ image }</div>
		</div>
	);
};

const Modal = ( { announcementId, pages, finishButtonText } ) => {
	const dispatch = useDispatch();
	const userId = useSelector( getCurrentUserId );
	const hasPreferences = useSelector( hasReceivedRemotePreferences );
	const dismissPreference = `announcement-modal-${ announcementId }-${ userId }`;
	const isDismissed = useSelector( ( state ) => getPreference( state, dismissPreference ) );
	const singlePage = pages.length === 1;

	if ( ! hasPreferences || isDismissed ) {
		return null;
	}

	const handleDismiss = () => {
		dispatch( savePreference( dismissPreference, 1 ) );
		dispatch(
			recordTracksEvent( 'calypso_announcement_modal_dismiss', {
				announcement_id: announcementId,
			} )
		);
	};

	const handleClick = ( ctaLink ) => {
		dispatch( savePreference( dismissPreference, 1 ) );
		dispatch(
			recordTracksEvent( 'calypso_announcement_modal_click', {
				announcement_id: announcementId,
			} )
		);
		pageRouter( ctaLink );
	};

	return (
		<Guide
			className="announcement-modal"
			onFinish={ handleDismiss }
			finishButtonText={ finishButtonText }
			pages={ pages.map( ( page ) => ( {
				content: (
					<Page
						image={
							<picture className="announcement-modal__picture" key={ page.featureImage }>
								<source srcSet={ page.featureImage } media="(min-width: 600px)" />
								<img alt="" src={ page.featureImage } />
							</picture>
						}
						headline={ page.headline }
						heading={ page.heading }
						content={ page.content }
						cta={ singlePage ? finishButtonText : null }
						handleClick={ () => ( page?.ctaLink ? handleClick( page.ctaLink ) : handleDismiss() ) }
					/>
				),
			} ) ) }
		/>
	);
};

export default Modal;
