import { useTranslate } from 'i18n-calypso';
import startLearningPrompt from 'calypso/assets/images/customer-home/illustration--secondary-start-learning.svg';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import { EDUCATION_BLOGGING_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';
import BloggingQuickStartModal from './blogging-quick-start-modal';

const BloggingQuickStart = () => {
	const translate = useTranslate();
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'courseSlug',
		COURSE_SLUGS.BLOGGING_QUICK_START
	);

	return (
		<EducationalContent
			title={ translate( 'Blog like an expert from day one' ) }
			description={ translate(
				"Learn the fundamentals from our bite-sized video course — you'll be up and running in just nine minutes."
			) }
			modalLinks={ [
				{
					ModalComponent: BloggingQuickStartModal,
					modalComponentProps: {
						isVisible: isModalOpen,
						onClose: ( event ) => {
							event.preventDefault();
							closeModal();
						},
					},
					onClick: () => openModal(),
					text: translate( 'Start learning' ),
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
