import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import playImage from 'calypso/assets/images/customer-home/plain-play.png';
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
			illustration={ playImage }
			cardName={ EDUCATION_BLOGGING_QUICK_START }
		/>
	);
};

export default BloggingQuickStart;
