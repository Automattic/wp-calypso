import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import earnCardPrompt from 'calypso/assets/images/customer-home/illustration--secondary-earn.svg';
import { COURSE_SLUGS } from 'calypso/data/courses';
import { useRouteModal } from 'calypso/lib/route-modal';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EducationalContent from '../educational-content';
import PaymentsFeaturesModal from './payments-features-modal';

export const EDUCATION_EARN = 'home-education-earn';

const EducationEarn = () => {
	const translate = useTranslate();
	const { isModalOpen, openModal, closeModal } = useRouteModal(
		'courseSlug',
		COURSE_SLUGS.PAYMENTS_FEATURES
	);

	return (
		<EducationalContent
			title={ translate( 'Make money from your website' ) }
			description={ translate(
				'Accept credit and debit card payments on your website for just about anything.'
			) }
			modalLinks={ [
				{
					ModalComponent: PaymentsFeaturesModal,
					modalComponentProps: {
						isVisible: isModalOpen,
						onClose: ( event ) => {
							event.preventDefault();
							closeModal();
						},
					},
					onClick: () => openModal(),
					text: translate( 'Start making money' ),
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
