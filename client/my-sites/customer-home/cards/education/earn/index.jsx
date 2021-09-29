import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';
import earnCardPrompt from 'calypso/assets/images/customer-home/illustration--secondary-earn.svg';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import EducationalContent from '../educational-content';

export const EDUCATION_EARN = 'home-education-earn';

const EducationEarn = ( { siteSlug } ) => {
	const translate = useTranslate();

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
			illustration={ earnCardPrompt }
			cardName={ EDUCATION_EARN }
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( EducationEarn );
