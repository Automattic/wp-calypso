import { useTranslate } from 'i18n-calypso';
import startLearningPrompt from 'calypso/assets/images/customer-home/illustration--secondary-start-learning.svg';
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
			title={ translate( 'Design like an expert' ) }
			description={ translate(
				'Master the basics of Site Editing with four short videos. Learn how to edit colors, fonts, layouts, and bring your style to your site.'
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
					text: translate( 'Start learning' ),
				},
			] }
			illustration={ startLearningPrompt }
			cardName={ EDUCATION_SITE_EDITOR_QUICK_START }
			width="183"
			height="120"
		/>
	);
};

export default SiteEditorQuickStart;
