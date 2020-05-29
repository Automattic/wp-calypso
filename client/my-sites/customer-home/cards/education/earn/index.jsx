/**
 * External dependencies
 */
import React from 'react';
import { useTranslate } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EducationalContent from '../educational-content';
import { getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Image dependencies
 */
import earnCardPrompt from 'assets/images/customer-home/illustration--business.svg';

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
					icon: 'arrow-right',
					text: translate( 'Start making money' ),
				},
				{
					externalLink: true,
					url: `https://wordpress.com/support/category/tools/earning-money-from-your-site/`,
					icon: 'arrow-right',
					text: translate( 'Learn more' ),
				},
			] }
			illustration={ earnCardPrompt }
		/>
	);
};

const mapStateToProps = ( state ) => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( EducationEarn );
