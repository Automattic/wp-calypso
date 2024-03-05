/* eslint-disable no-restricted-imports */
import { HelpCenter } from '@automattic/data-stores';
import { useDispatch } from '@wordpress/data';
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
	siteId: string;
}

const WhatsNewGuide: React.FC< Props > = ( { onClose, siteId } ) => {
	const { setSeenWhatsNewAnnouncements } = useDispatch( HELP_CENTER_STORE );
	const { data, isLoading } = useWhatsNewAnnouncementsQuery( siteId );

	useEffect( () => {
		// check for whether the announcement has been seen already.
		if ( data && data.length ) {
			const announcementIds = data.map( ( item ) => item.announcementId );
			setSeenWhatsNewAnnouncements( announcementIds );
		}
	}, [ data, setSeenWhatsNewAnnouncements ] );

	if ( ! data || isLoading ) {
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
