import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
//@TODO: Swap this out for the correct illustration
import earnCardPrompt from 'calypso/assets/images/customer-home/illustration--secondary-earn.svg';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EducationalContent from '../educational-content';

export const EDUCATION_STORE = 'home-education-store';

const EducationStore = () => {
	const translate = useTranslate();

	return (
		<EducationalContent
			title={ translate( 'How to set up an online store' ) }
			description={ translate(
				'Payments features on WordPress.com allow you to make money from your site in many ways.'
			) }
			links={ [
				{
					calypsoLink: false,
					url: `https://wordpress.com/support/video-tutorials-add-payments-features-to-your-site-with-our-guides/`,
					text: translate( 'Learn how' ),
				},
			] }
			illustration={ earnCardPrompt }
			cardName={ EDUCATION_STORE }
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

export default connect( mapStateToProps )( EducationStore );
