import { useTranslate } from 'i18n-calypso';
import illustration from 'calypso/assets/images/customer-home/illustration--course-site-editor-quick-start.svg';
import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import { EDUCATION_SITE_EDITOR_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const SiteEditorQuickStart = () => {
	const translate = useTranslate();
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'courseSlug',
		COURSE_SLUGS.SITE_EDITOR_QUICK_START
	);

	return (
		<EducationalContent
			title={ translate( 'Course: Create your website' ) }
			description={ translate(
				'In this series of videos, we’ll walk you through the process of designing your website and publishing it online.'
			) }
			modalLinks={ [
				{
					ModalComponent: VideoModal,
					modalComponentProps: {
						isVisible: isModalOpen,
						onClose: ( event ) => {
							event.preventDefault();
							closeModal();
						},
						courseSlug: COURSE_SLUGS.SITE_EDITOR_QUICK_START,
					},
					onClick: openModal,
					text: translate( 'Start course' ),
				},
			] }
			illustration={ illustration }
			cardName={ EDUCATION_SITE_EDITOR_QUICK_START }
			width="183"
			height="120"
		/>
	);
};

export default SiteEditorQuickStart;
