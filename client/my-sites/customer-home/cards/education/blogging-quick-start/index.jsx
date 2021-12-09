import config from '@automattic/calypso-config';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import playImage from 'calypso/assets/images/customer-home/plain-play.png';
import { EDUCATION_BLOGGING_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';
import BloggingQuickStartModal from './blogging-quick-start-modal';

const BloggingQuickStart = () => {
	const { localeSlug } = useTranslate();
	const isEnglish = config( 'english_locales' ).includes( localeSlug );
	const [ isModalVisible, setIsModalVisible ] = useState( false );

	if ( ! isEnglish ) {
		return null;
	}

	return (
		<EducationalContent
			title="Blog like an expert from day one"
			description="Learn the fundamentals from our bite-sized video course &mdash; you'll be up and running in just nine minutes."
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
					text: 'Start learning',
				},
			] }
			illustration={ playImage }
			cardName={ EDUCATION_BLOGGING_QUICK_START }
		/>
	);
};

export default BloggingQuickStart;
