import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import formatNumber from '@automattic/components/src/number-formatters/lib/format-number';
import formatCurrency from '@automattic/format-currency';
import { Icon, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { CONTACT_URL_HASH_FRAGMENT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import { useDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';
import SimpleList from '../../common/simple-list';
import { useGetProductPricingInfo } from '../../wpcom-overview/hooks/use-total-invoice-value';
import getPressablePlan from '../lib/get-pressable-plan';
import getPressableShortName from '../lib/get-pressable-short-name';

type Props = {
	selectedPlan: APIProductFamilyProduct | null;
	onSelectPlan: () => void;
	isLoading?: boolean;
	pressableOwnership?: 'regular' | 'none' | 'agency';
	isReferMode?: boolean;
};

export default function PlanSelectionDetails( {
	selectedPlan,
	onSelectPlan,
	isLoading,
	pressableOwnership,
	isReferMode,
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const isNewHostingPage = isEnabled( 'a4a-hosting-page-redesign' );

	const info = selectedPlan?.slug ? getPressablePlan( selectedPlan?.slug ) : null;

	const customString = translate( 'Custom' );

	const userProducts = useSelector( getProductsList );
	const { getProductPricingInfo } = useGetProductPricingInfo();

	const { discountedCost } = selectedPlan
		? getProductPricingInfo( userProducts, selectedPlan, 1 )
		: { discountedCost: 0 };

	const onContactUs = useCallback( () => {
		dispatch( recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_contact_us_click' ) );
	}, [ dispatch ] );

	const onScheduleDemo = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_a4a_marketplace_hosting_pressable_schedule_demo_click' )
		);
	}, [ dispatch ] );

	const PRESSABLE_CONTACT_LINK = 'https://pressable.com/request-demo';

	if ( isLoading ) {
		return (
			<section className="pressable-overview-plan-selection__details is-loader">
				<div className="pressable-overview-plan-selection__details-card"></div>
				<div className="pressable-overview-plan-selection__details-card is-aside"></div>
			</section>
		);
	}

	const isRegularOwnership = pressableOwnership === 'regular';

	return (
		<section className="pressable-overview-plan-selection__details">
			<div className="pressable-overview-plan-selection__details-card">
				<div className="pressable-overview-plan-selection__details-card-header">
					<h3 className="pressable-overview-plan-selection__details-card-header-title plan-name">
						{ isNewHostingPage
							? translate( 'Pressable' )
							: translate( '%(planName)s plan', {
									args: {
										planName: selectedPlan
											? getPressableShortName( selectedPlan.name )
											: customString,
									},
									comment: '%(planName)s is the name of the selected plan.',
							  } ) }
					</h3>

					{ selectedPlan && (
						<div className="pressable-overview-plan-selection__details-card-header-price">
							<strong className="pressable-overview-plan-selection__details-card-header-price-value">
								{ formatCurrency( discountedCost, selectedPlan.currency ) }
							</strong>
							<span className="pressable-overview-plan-selection__details-card-header-price-interval">
								{ selectedPlan.price_interval === 'day' && translate( 'per plan per day' ) }
								{ selectedPlan.price_interval === 'month' && translate( 'per plan per month' ) }
							</span>
						</div>
					) }

					{ isRegularOwnership && ! isReferMode && (
						<div className="pressable-overview-plan-selection__details-card-header-subtitle is-regular-ownership">
							{ translate(
								'{{b}}You own this plan.{{/b}} Manage your hosting seamlessly by accessing the Pressable dashboard',
								{
									components: { b: <b /> },
								}
							) }
						</div>
					) }
				</div>

				{ ! isRegularOwnership && ! isReferMode && (
					<SimpleList
						items={ [
							info?.install
								? translate(
										'{{b}}%(count)d{{/b}} WordPress install',
										'{{b}}%(count)d{{/b}} WordPress installs',
										{
											args: {
												count: info.install,
											},
											count: info.install,
											components: { b: <b /> },
											comment: '%(count)s is the number of WordPress installs.',
										}
								  )
								: translate( 'Custom WordPress installs' ),
							translate( '{{b}}%(count)s{{/b}} visits per month', {
								args: {
									count: info ? formatNumber( info.visits ) : customString,
								},
								components: { b: <b /> },
								comment: '%(count)s is the number of visits per month.',
							} ),
							translate( '{{b}}%(size)s{{/b}} storage per month', {
								args: {
									size: info ? `${ info.storage }GB` : customString,
								},
								components: { b: <b /> },
								comment: '%(size)s is the amount of storage in gigabytes.',
							} ),
							...( isNewHostingPage
								? [
										translate( '{{b}}Unmetered{{/b}} bandwidth', {
											components: { b: <b /> },
										} ),
								  ]
								: [] ),
						] }
					/>
				) }

				{ isReferMode ? (
					<div>
						<div className="pressable-overview-plan-selection__details-card-header-subtitle is-refer-mode">
							{ translate(
								'Pressable hosting will be included in the referral program in the future.'
							) }
						</div>
						<Button
							className="pressable-overview-plan-selection__details-card-cta-button"
							href={ CONTACT_URL_HASH_FRAGMENT }
							primary
						>
							{ translate( 'Contact support' ) } <Icon icon={ external } size={ 16 } />
						</Button>
					</div>
				) : (
					<>
						{ selectedPlan && (
							<>
								{ isRegularOwnership ? (
									<Button
										target="_blank"
										rel="norefferer nooppener"
										href="https://my.pressable.com/agency/auth"
									>
										{ translate( 'Manage in Pressable' ) }
										<Icon icon={ external } size={ 18 } />
									</Button>
								) : (
									<Button
										className="pressable-overview-plan-selection__details-card-cta-button"
										onClick={ onSelectPlan }
										primary
									>
										{ isNewHostingPage
											? translate( 'Select this plan' )
											: translate( 'Select %(planName)s plan', {
													args: {
														planName: selectedPlan
															? getPressableShortName( selectedPlan.name )
															: customString,
													},
													comment: '%(planName)s is the name of the selected plan.',
											  } ) }
									</Button>
								) }
							</>
						) }

						{ ! selectedPlan && (
							<Button
								className="pressable-overview-plan-selection__details-card-cta-button"
								onClick={ onContactUs }
								href={ PRESSABLE_CONTACT_LINK }
								target="_blank"
								primary
							>
								{ translate( 'Contact us' ) } <Icon icon={ external } size={ 16 } />
							</Button>
						) }
					</>
				) }
			</div>

			{ isNewHostingPage ? (
				<div className="pressable-overview-plan-selection__details-card is-aside">
					<h3 className="pressable-overview-plan-selection__details-card-header-title">
						{ translate( 'Schedule a demo and personal consultation' ) }
					</h3>
					<div className="pressable-overview-plan-selection__details-card-header-subtitle">
						{ translate(
							'One of our friendly experts would be happy to give you a one-on-one tour of our platform and discuss:'
						) }
					</div>

					<SimpleList
						items={ [
							translate( 'Our support, service, and pricing flexibility' ),
							translate( 'The best hosting plan for your needs' ),
							translate( 'How to launch and manage WordPress sites' ),
							translate( 'The free perks that come with Pressable' ),
						] }
					/>
					<Button
						className="pressable-overview-plan-selection__details-card-cta-button"
						onClick={ onScheduleDemo }
						href={ PRESSABLE_CONTACT_LINK }
						target="_blank"
					>
						{ translate( 'Schedule a Demo' ) } <Icon icon={ external } size={ 18 } />
					</Button>
				</div>
			) : (
				<div className="pressable-overview-plan-selection__details-card is-aside">
					<h3 className="pressable-overview-plan-selection__details-card-header-title">
						{ translate( 'All plans include:' ) }
					</h3>

					<SimpleList
						items={ [
							translate( '24/7 WordPress hosting support' ),
							translate( 'WP Cloud platform' ),
							translate( 'Jetpack Security (optional)' ),
							translate( 'Free site migrations' ),
						] }
					/>
				</div>
			) }
		</section>
	);
}
