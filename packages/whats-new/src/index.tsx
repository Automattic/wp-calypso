/* eslint-disable no-restricted-imports */
import { HelpCenter, HelpCenterSelect } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import Guide from './components/guide';
import { useWhatsNewAnnouncementsQuery } from './hooks/use-whats-new-announcements-query';
import WhatsNewPage from './whats-new-page';
import './style.scss';

export const HELP_CENTER_STORE = HelpCenter.register();
export {
	useWhatsNewAnnouncementsQuery,
	type WhatsNewAnnouncement,
} from './hooks/use-whats-new-announcements-query';

interface Props {
	onClose: () => void;
}

const WhatsNewGuide: React.FC< Props > = ( { onClose } ) => {
	const { setLatestSeenWhatsNewModalItem } = useDispatch( HELP_CENTER_STORE );

	const { isWhatsNewModalShown } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isWhatsNewModalShown: helpCenterSelect.isWhatsNewModalShown(),
		};
	}, [] );

	// needs to be made accessible in other places...
	const { data, isLoading } = useWhatsNewAnnouncementsQuery();

	useEffect( () => {
		// check for whether the announcement has been seen already.
		if ( isWhatsNewModalShown && data && data.length ) {
			// get highest announcement id and set it as the latest seen announcement
			const highestId = Math.max( ...data.map( ( item ) => parseInt( item.announcementId ) ) );
			setLatestSeenWhatsNewModalItem( highestId );
		}
	}, [ data, isWhatsNewModalShown, setLatestSeenWhatsNewModalItem ] );

	if ( ! isWhatsNewModalShown || ! data || isLoading ) {
		return null;
	}

	return (
		<Guide
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			className="whats-new-guide__main"
			onFinish={ onClose }
		>
			{ data.map( ( page, index ) => (
				<WhatsNewPage
					key={ page.announcementId }
					pageNumber={ index + 1 }
					isLastPage={ index === data.length - 1 }
					description={ page.description }
					heading={ page.heading }
					imageSrc={ page.imageSrc }
					link={ page.link }
				/>
			) ) }
		</Guide>
	);
};

export default WhatsNewGuide;
