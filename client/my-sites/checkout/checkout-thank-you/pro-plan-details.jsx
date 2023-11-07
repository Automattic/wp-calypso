import { isPro, isGSuiteOrExtraLicenseOrGoogleWorkspace } from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import earnImage from 'calypso/assets/images/customer-home/illustration--task-earn.svg';
import analyticsImage from 'calypso/assets/images/illustrations/google-analytics.svg';
import jetpackBackupImage from 'calypso/assets/images/illustrations/jetpack-backup.svg';
import updatesImage from 'calypso/assets/images/illustrations/updates.svg';
import QueryProductsList from 'calypso/components/data/query-products-list';
import PurchaseDetail from 'calypso/components/purchase-detail';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getProductsList } from 'calypso/state/products-list/selectors';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import CustomDomainPurchaseDetail from './custom-domain-purchase-detail';
import GoogleAppsDetails from './google-apps-details';

function trackOnboardingButtonClick() {
	recordTracksEvent( 'calypso_checkout_thank_you_onboarding_click' );
}

const ProPlanDetails = ( {
	selectedSite,
	sitePlans,
	selectedFeature,
	purchases,
	hasProductsList,
} ) => {
	const shouldPromoteJetpack = useSelector( ( state ) =>
		isJetpackSectionEnabledForSite( state, selectedSite?.ID )
	);

	const plan = sitePlans.data?.find( isPro );
	const googleAppsWasPurchased = purchases.some( isGSuiteOrExtraLicenseOrGoogleWorkspace );

	return (
		<div>
			{ googleAppsWasPurchased && <GoogleAppsDetails purchases={ purchases } /> }
			{ ! hasProductsList && <QueryProductsList /> }

			<CustomDomainPurchaseDetail
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
			/>

			<PurchaseDetail
				icon={ <img alt={ i18n.translate( 'Earn Illustration' ) } src={ earnImage } /> }
				title={ i18n.translate( 'Make money with your website' ) }
				description={ i18n.translate(
					'Accept credit card payments today for just about anything – physical and digital goods, services, ' +
						'donations and tips, or access to your exclusive content.'
				) }
				buttonText={ i18n.translate( 'Start Earning' ) }
				href={ '/earn/' + selectedSite.slug }
			/>

			{ shouldPromoteJetpack && (
				<PurchaseDetail
					icon={ <img alt="" src={ jetpackBackupImage } /> }
					title={ i18n.translate( 'Check your backups' ) }
					description={ i18n.translate(
						'Backup gives you granular control over your site, with the ability to restore it to any previous state, and export it at any time.'
					) }
					buttonText={ i18n.translate( 'See the latest backup' ) }
					href={ `/backup/${ selectedSite.slug }` }
					onClick={ trackOnboardingButtonClick }
				/>
			) }

			{ ! selectedFeature && (
				<PurchaseDetail
					icon={ <img alt="" src={ updatesImage } /> }
					title={ i18n.translate( 'Add a Plugin' ) }
					description={ i18n.translate(
						'Search and add plugins right from your dashboard, or upload a plugin ' +
							'from your computer with a drag-and-drop interface.'
					) }
					buttonText={ i18n.translate( 'Upload a plugin now' ) }
					href={ '/plugins/manage/' + selectedSite.slug }
				/>
			) }

			<PurchaseDetail
				icon={ <img alt="" src={ analyticsImage } /> }
				title={ i18n.translate( 'Connect to Google Analytics' ) }
				description={ i18n.translate(
					"Complement WordPress.com's stats with Google's in-depth look at your visitors and traffic patterns."
				) }
				buttonText={ i18n.translate( 'Connect Google Analytics' ) }
				href={ '/settings/analytics/' + selectedSite.slug }
			/>
		</div>
	);
};

ProPlanDetails.propTypes = {
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ).isRequired,
	selectedFeature: PropTypes.object,
	sitePlans: PropTypes.object.isRequired,
};
export default connect( ( state ) => {
	const productsList = getProductsList( state );
	return {
		hasProductsList: Object.keys( productsList ).length > 0,
	};
} )( ProPlanDetails );
