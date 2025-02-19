import { Button, Tooltip } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { Icon, external } from '@wordpress/icons';
import { useTranslate, numberFormat, numberFormatCompact } from 'i18n-calypso';
import { useCallback, useRef, useState } from 'react';
import { CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { useDispatch, useSelector } from 'calypso/state';
import { isAgencyOwner } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { useGetProductPricingInfo } from '../../hooks/use-total-invoice-value';
import getPressablePlan from '../lib/get-pressable-plan';

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

	const info = selectedPlan?.slug ? getPressablePlan( selectedPlan?.slug ) : null;

	const customString = translate( 'Custom' );

	const userProducts = useSelector( getProductsList );
	const { getProductPricingInfo } = useGetProductPricingInfo();

	const isOwner = useSelector( isAgencyOwner );

	const managedButtonRef = useRef< HTMLDivElement | null >( null );

	const [ showManagedTooltip, setShowManagedTooltip ] = useState( false );

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

	if ( ! isReferMode && isLoading ) {
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
						{ selectedPlan ? selectedPlan.name : customString }
					</h3>

					{ ! isReferMode && selectedPlan && (
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
					{ isReferMode && (
						<div className="pressable-overview-plan-selection__details-card-header-price">
							<strong className="pressable-overview-plan-selection__details-card-header-coming-soon">
								{ translate( 'Coming soon' ) }
							</strong>
						</div>
					) }
				</div>

				{ ! isRegularOwnership && ! isReferMode && (
					<SimpleList
						items={ [
							info?.install
								? translate(
										'{{b}}%(installsCount)s{{/b}} WordPress install',
										'{{b}}%(installsCount)s{{/b}} WordPress installs',
										{
											args: {
												installsCount: numberFormat( info.install ),
											},
											count: info.install,
											components: { b: <b /> },
											comment: '%(count)s is the number of WordPress installs.',
										}
								  )
								: translate( 'Custom WordPress installs' ),
							translate( '{{b}}%(count)s{{/b}} visits per month*', {
								args: {
									count: info ? numberFormatCompact( info.visits ) : customString,
								},
								components: { b: <b /> },
								comment: '%(count)s is the number of visits per month.',
							} ),
							translate( '{{b}}%(size)s{{/b}} storage per month*', {
								args: {
									size: info ? `${ info.storage }GB` : customString,
								},
								components: { b: <b /> },
								comment: '%(size)s is the amount of storage in gigabytes.',
							} ),
							translate( '{{b}}Unmetered{{/b}} bandwidth', {
								components: { b: <b /> },
							} ),
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
							href={ CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT }
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
									<div
										className="pressable-overview-plan-selection__manage-account-button-container"
										ref={ managedButtonRef }
										role="button"
										tabIndex={ 0 }
										onMouseEnter={ () => setShowManagedTooltip( true ) }
										onMouseLeave={ () => setShowManagedTooltip( false ) }
										onMouseDown={ () => setShowManagedTooltip( false ) }
									>
										<Button
											target="_blank"
											rel="norefferer nooppener"
											href="https://my.pressable.com/agency/auth"
											disabled={ ! isOwner }
										>
											{ isOwner
												? translate( 'Manage in Pressable' )
												: translate( 'Managed by agency owner' ) }
											{ isOwner && <Icon icon={ external } size={ 18 } /> }
										</Button>
									</div>
								) : (
									<Button
										className="pressable-overview-plan-selection__details-card-cta-button"
										onClick={ onSelectPlan }
										primary
									>
										{ translate( 'Select this plan' ) }
									</Button>
								) }

								<Tooltip
									context={ managedButtonRef.current }
									isVisible={ ! isOwner && showManagedTooltip }
									position="bottom"
									className="pressable-overview-plan-selection__tooltip"
								>
									{ translate(
										"This Pressable account is managed by the Agency Owner user on your account. If you'd like access to this Pressable account, request that they add you as a user in Pressable."
									) }
								</Tooltip>
							</>
						) }

						{ ! selectedPlan && (
							<Button
								className="pressable-overview-plan-selection__details-card-cta-button"
								onClick={ onContactUs }
								href={ CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT }
								primary
							>
								{ translate( 'Contact us' ) } <Icon icon={ external } size={ 16 } />
							</Button>
						) }
					</>
				) }
			</div>

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

			<div className="pressable-overview-plan-selection__details-hint">
				{ translate(
					"*If you exceed your plan's storage or traffic limits, you will be charged {{b}}$0.50{{/b}} per GB and {{b}}$8{{/b}} per 10K visits per month.",
					{
						components: {
							b: <b />,
						},
					}
				) }
			</div>
		</section>
	);
}
