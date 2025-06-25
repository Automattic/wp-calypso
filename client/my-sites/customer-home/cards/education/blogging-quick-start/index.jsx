import { useTranslate } from 'i18n-calypso';
import startLearningPrompt from 'calypso/assets/images/customer-home/illustration--secondary-start-learning.svg';
import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import { EDUCATION_BLOGGING_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const BloggingQuickStart = () => {
	const translate = useTranslate();
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'courseSlug',
		COURSE_SLUGS.BLOGGING_QUICK_START
	);

	return (
		<EducationalContent
			title={ translate( 'Course: Create your blog' ) }
			description={ translate(
				'Follow along as we show you how to start your blog, publish posts, and connect with your audience.'
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
						courseSlug: COURSE_SLUGS.BLOGGING_QUICK_START,
					},
					onClick: openModal,
					text: translate( 'Start course' ),
				},
			] }
			illustration={ startLearningPrompt }
			cardName={ EDUCATION_BLOGGING_QUICK_START }
			width="183"
			height="120"
		/>
	);
};

export default BloggingQuickStart;
