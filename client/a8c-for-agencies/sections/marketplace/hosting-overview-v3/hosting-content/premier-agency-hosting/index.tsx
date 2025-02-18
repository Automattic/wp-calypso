import { JetpackLogo } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { BackgroundType10 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import useFetchLicenses from 'calypso/a8c-for-agencies/data/purchases/use-fetch-licenses';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-1.png';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/premier-testimonial-2.png';
import {
	LicenseFilter,
	LicenseSortDirection,
	LicenseSortField,
} from 'calypso/jetpack-cloud/sections/partner-portal/types';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import HostingAdditionalFeaturesSection from '../../../common/hosting-additional-features-section';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import { MarketplaceTypeContext } from '../../../context';
import useProductAndPlans from '../../../hooks/use-product-and-plans';
import useExistingPressablePlan from '../../../pressable-overview/hooks/use-existing-pressable-plan';
import useGetPressablePlanByProductId from '../../../pressable-overview/hooks/use-get-pressable-plan-by-product-id';
import usePressableOwnershipType from '../../hooks/use-pressable-ownership-type';
import ClientRelationships from '../common/client-relationships';
import HostingFeatures from '../common/hosting-features';
import PressablePlanSection from './pressable-plan-section';
import PressableUsageSection from './pressable-usage-section';

import './style.scss';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function PremierAgencyHosting( { onAddToCart }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onJetpackCompleteMoreLinkClick = () => {
		dispatch( recordTracksEvent( 'a4a_hosting_premier_jetpack_complete_more_link_click' ) );
	};

	const { marketplaceType } = useContext( MarketplaceTypeContext );
	const pressableOwnership = usePressableOwnershipType();

	const { pressablePlans } = useProductAndPlans( {
		selectedSite: null,
		productSearchQuery: '',
	} );

	const {
		existingPlan,
		pressablePlan: existingPlanInfo,
		isReady: isExistingPlanFetched,
	} = useExistingPressablePlan( {
		plans: pressablePlans,
	} );

	const isReferralMode = marketplaceType === 'referral';

	const { data } = useFetchLicenses(
		LicenseFilter.NotRevoked,
		'pressable',
		LicenseSortField.IssuedAt,
		LicenseSortDirection.Descending,
		1,
		100
	);

	const licenses = data?.items;

	// Find the first occurrence for of Pressable license with its referral as null
	const agencyPressableLicense = licenses?.find(
		( license ) => license.licenseKey.startsWith( 'pressable' ) && ! license.referral
	);

	const agencyPressablePlan = useGetPressablePlanByProductId( {
		product_id: agencyPressableLicense ? agencyPressableLicense.productId : 0,
	} );

	return (
		<div className="premier-agency-hosting">
			{ agencyPressablePlan && ! isReferralMode && (
				<PressableUsageSection existingPlan={ agencyPressablePlan } />
			) }

			<PressablePlanSection
				onSelect={ onAddToCart }
				isReferralMode={ isReferralMode }
				pressableOwnership={ isReferralMode || agencyPressablePlan ? 'agency' : pressableOwnership }
				existingPlan={ existingPlan }
				existingPlanInfo={ existingPlanInfo }
				isFetching={ isExistingPlanFetched }
			/>

			<HostingFeatures heading={ translate( 'Included with every Pressable site' ) } />

			<HostingAdditionalFeaturesSection
				icon={ <JetpackLogo size={ 16 } /> }
				heading={ translate( 'Jetpack Complete included' ) }
				subheading={ translate( "Supercharge your clients' sites" ) }
				description={ translate(
					'Every Pressable site comes with a free Jetpack Complete license — an $899/year/site value.'
				) }
				items={ [
					translate( 'VaultPress Backup w/ 1TB storage' ),
					translate( 'Scan w/ WAF' ),
					translate( 'Akismet Anti-spam w/ 60k API calls/mo' ),
					translate( 'Stats w/ 100k views/mo (Commercial use)' ),
					translate( 'VideoPress w/ 1TB storage' ),
					translate( 'Boost w/ Auto CSS Generation' ),
					translate( 'Social Advanced w/ unlimited shares' ),
					translate( 'Site Search up to 100k records and 100k requests/mo' ),
					translate( 'CRM Entrepreneur' ),
					translate( 'All Jetpack features' ),
					translate( '{{a}}And more{{/a}} ↗', {
						components: {
							a: (
								<a
									href="https://jetpack.com/complete/"
									target="_blank"
									rel="noopener noreferrer"
									onClick={ onJetpackCompleteMoreLinkClick }
								/>
							),
						},
					} ),
				] }
				fourRows
			/>

			<HostingTestimonialsSection
				heading={ translate( 'Love for Pressable hosting' ) }
				subheading={ translate( 'What agencies say' ) }
				background={ BackgroundType10 }
				items={ [
					{
						profile: {
							avatar: ProfileAvatar1,
							name: 'Ben Giordano',
							title: translate( 'Founder, %(companyName)s', {
								args: {
									companyName: 'Freshy',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'freshysites.com',
						},
						testimonial:
							"We needed a hosting provider that was as knowledgeable about WordPress as we are. With Pressable's affiliation with Automattic, the same people behind WordPress.com and WordPress VIP, we knew we'd found the right home for our client portfolio.",
					},
					{
						profile: {
							name: 'Justin Barrett',
							avatar: ProfileAvatar2,
							title: translate( 'Director of Technology, %(companyName)s', {
								args: {
									companyName: 'Autoshop Solutions',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'autoshopsolutions.com',
						},
						testimonial:
							'As an agency with hundreds of clients, Pressable changed the game for our ability to grow as a business and offer best-in-class products for our clients. With fantastic support, superior uptime, and solutions to make even the largest challenges possible, Pressable is always there.',
					},
				] }
			/>

			<ClientRelationships />
		</div>
	);
}
