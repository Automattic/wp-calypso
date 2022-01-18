import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import startLearningPrompt from 'calypso/assets/images/customer-home/illustration--secondary-start-learning.svg';
import { EDUCATION_BLOGGING_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';
import BloggingQuickStartModal from './blogging-quick-start-modal';

const BloggingQuickStart = () => {
	const translate = useTranslate();
	const [ isModalVisible, setIsModalVisible ] = useState( false );

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
						isVisible: isModalVisible,
						onClose: ( event ) => {
							event.preventDefault();
							setIsModalVisible( false );
						},
					},
					onClick: () => setIsModalVisible( true ),
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
