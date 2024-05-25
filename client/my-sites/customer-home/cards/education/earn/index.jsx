import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import earnCardPrompt from 'calypso/assets/images/customer-home/illustration--secondary-earn.svg';
import VideoModal from 'calypso/components/videos-ui/video-modal';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EducationalContent from '../educational-content';

export const EDUCATION_EARN = 'home-education-earn';

const EducationEarn = ( { siteSlug } ) => {
	const translate = useTranslate();
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'coursePaymentsModal',
		COURSE_SLUGS.PAYMENTS_FEATURES
	);

	return (
		<EducationalContent
			title={ translate( 'Make money from your website' ) }
			description={ translate(
				'Accept credit and debit card payments on your website for just about anything.'
			) }
			links={ [
				{
					calypsoLink: true,
					url: `/earn/${ siteSlug }`,
					text: translate( 'Start making money' ),
				},
			] }
			modalLinks={ [
				{
					calypsoLink: true,
					url: `/earn/${ siteSlug }`,
					ModalComponent: VideoModal,
					modalComponentProps: {
						isVisible: isModalOpen,
						onClose: ( event ) => {
							event.preventDefault();
							closeModal();
						},
						courseSlug: COURSE_SLUGS.PAYMENTS_FEATURES,
					},
					onClick: openModal,
					text: translate( 'Learn more' ),
				},
			] }
			illustration={ earnCardPrompt }
			cardName={ EDUCATION_EARN }
			width="201"
			height="114"
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( EducationEarn );
