import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';

const Modals = () => {
	const { closeModal, isModalOpen } = useRouteModal(
		'coursePaymentsModal',
		COURSE_SLUGS.PAYMENTS_FEATURES
	);

	return (
		<>
			<PluginsAnnouncementModal />
			<VideoModal
				isVisible={ isModalOpen }
				onClose={ closeModal }
				courseSlug={ COURSE_SLUGS.PAYMENTS_FEATURES }
			/>
		</>
	);
};

export default Modals;
