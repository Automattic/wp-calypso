/* eslint-disable no-restricted-imports */
import { useEffect } from 'react';
import Guide from './components/guide';
import { useSeenWhatsNewAnnouncementsMutation } from './hooks/use-seen-whats-new-announcements-mutation';
import { useWhatsNewAnnouncementsQuery } from './hooks/use-whats-new-announcements-query';
import WhatsNewPage from './whats-new-page';
import './style.scss';

interface Props {
	onClose: () => void;
	siteId: string | number;
}

const WhatsNewGuide: React.FC< Props > = ( { onClose, siteId } ) => {
	const { data, isLoading } = useWhatsNewAnnouncementsQuery( siteId );
	const { mutate } = useSeenWhatsNewAnnouncementsMutation();

	useEffect( () => {
		// check for whether the announcement has been seen already.
		if ( data && data.length ) {
			const announcementIds = data.map( ( item ) => item.announcementId );
			mutate( announcementIds );
		}
	}, [ data, mutate ] );

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
