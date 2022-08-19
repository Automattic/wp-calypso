import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { BlankCanvas } from 'calypso/components/blank-canvas';
import VideosUi from 'calypso/components/videos-ui';
import ModalFooterBar from 'calypso/components/videos-ui/modal-footer-bar';
import ModalHeaderBar from 'calypso/components/videos-ui/modal-header-bar';
import { COURSE_SLUGS } from 'calypso/data/courses';
import './style.scss';

const PaymentsFeaturesModal = ( props ) => {
	const { isVisible = false, onClose = () => {} } = props;
	const translate = useTranslate();

	// Scroll to top on initial load regardless of previous page position
	useEffect( () => {
		if ( isVisible ) {
			window.scrollTo( 0, 0 );
		}
	}, [ isVisible ] );

	return (
		isVisible && (
			<BlankCanvas className={ 'payments-features-modal' }>
				<BlankCanvas.Content>
					<VideosUi
						courseSlug={ COURSE_SLUGS.PAYMENTS_FEATURES }
						HeaderBar={ ( headerProps ) => (
							<ModalHeaderBar onClose={ onClose } { ...headerProps } />
						) }
						FooterBar={ ( footerProps ) => (
							<ModalFooterBar onBackClick={ onClose } { ...footerProps } />
						) }
						areVideosTranslated={ false }
						title={ translate( 'Add Payments Features to Your Site' ) }
						subtitle={ translate( 'Make Money' ) }
						options={ [
							translate( 'Making Money with Payments Features' ),
							translate( 'Premium Membership Blog' ),
							translate( 'Paid Subscription Newsletter' ),
							translate( 'Run a Crowdfunding Campaign' ),
						] }
					/>
				</BlankCanvas.Content>
			</BlankCanvas>
		)
	);
};

export default PaymentsFeaturesModal;
