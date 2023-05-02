import { format as formatUrl, getUrlParts, getUrlFromParts } from '@automattic/calypso-url';
import { Gridicon } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import SocialImage from 'calypso/assets/images/jetpack/rna-image-social.png';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './promo.scss';

export const Promo = ( { isSocialActive, adminUrl, translate } ) => {
	const titleHeader = translate( 'Social', { context: 'Jetpack product name' } );
	const features = [
		translate( 'Connect with Facebook, LinkedIn and Tumblr' ),
		translate( 'Select the social media to share posts while publishing' ),
		translate( 'Publish custom messages' ),
	];

	const ctaProps = isSocialActive
		? {
				ctaButtonURL: adminUrl,
				ctaButtonLabel: translate( 'Enable Social' ),
		  }
		: {
				ctaButtonURL: 'https://wordpress.org/plugins/jetpack-social',
				ctaButtonLabel: translate( 'Get Started' ),
		  };

	return (
		<Main wideLayout className="jetpack-social__promo">
			<DocumentHead title={ titleHeader } />
			<div className="jetpack-social__promo-content">
				<JetpackRnaActionCard
					headerText={ titleHeader }
					subHeaderText={ translate(
						"Share your posts with your social media network and increase your site's traffic"
					) }
					cardImage={ SocialImage }
					cardImageAlt={ translate( 'Get Social' ) }
					{ ...ctaProps }
				>
					<ul className="jetpack-social__features">
						{ features.map( ( feature, i ) => (
							<li className="jetpack-social__feature" key={ i }>
								<Gridicon size={ 18 } icon="checkmark" /> { preventWidows( feature ) }
							</li>
						) ) }
					</ul>
				</JetpackRnaActionCard>
			</div>
		</Main>
	);
};

const getSocialAdminUrl = ( state, siteId ) => {
	const siteAdminUrl = getSiteAdminUrl( state, siteId );
	if ( null === siteAdminUrl ) {
		return undefined;
	}

	const parts = getUrlParts( siteAdminUrl + 'admin.php' );
	parts.searchParams.set( 'page', 'jetpack-social' );

	return formatUrl( getUrlFromParts( parts ) );
};

export default connect( ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		adminUrl: getSocialAdminUrl( state, siteId ),
	};
} )( localize( Promo ) );
