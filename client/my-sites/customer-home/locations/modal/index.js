import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';

const Modals = () => {
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'myHomeCoursePaymentsModal',
		COURSE_SLUGS.PAYMENTS_FEATURES
	);

	return (
		<>
			<PluginsAnnouncementModal />
			<VideoModal
				isVisible={ isModalOpen }
				onClose={ closeModal }
				onOpen={ openModal }
				courseSlug={ COURSE_SLUGS.PAYMENTS_FEATURES }
			/>
		</>
	);
};

export default Modals;
