import config from '@automattic/calypso-config';
import { Dialog, Gridicon } from '@automattic/components';
import { useState } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import coursesLogo from 'calypso/assets/images/customer-home/courses-logo.png';
import VideosUi from 'calypso/components/videos-ui';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { EDUCATION_BLOGGING_QUICK_START } from 'calypso/my-sites/customer-home/cards/constants';
import EducationalContent from '../educational-content';

const BloggingQuickStartModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;

	return (
		<Dialog
			className="blogging-quick-start__modal"
			isVisible={ isVisible }
			buttons={ [
				{
					label: 'Close',
					isPrimary: true,
					onClick: onClose,
				},
			] }
			onClose={ onClose }
		>
			<Gridicon
				icon="cross"
				className="blogging-quick-start__modal-close-icon"
				onClick={ onClose }
			/>
			<TrackComponentView eventName={ 'calypso_theme_blogging_quick_start_modal_view' } />
			<div className="blogging-quick-start__modal-wrapper">
				<VideosUi />
			</div>
		</Dialog>
	);
};

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
			description="Learn the fundamentals from our bite-sized video course—you'll be up and running in just nine minutes."
			modalLinks={ [
				{
					ModalComponent: BloggingQuickStartModal,
					modalComponentProps: {
						isVisible: isModalVisible,
						onClose: () => setIsModalVisible( false ),
					},
					onClick: () => setIsModalVisible( true ),
					text: 'Start learning',
				},
			] }
			illustration={ coursesLogo }
			cardName={ EDUCATION_BLOGGING_QUICK_START }
		/>
	);
};

export default BloggingQuickStart;
