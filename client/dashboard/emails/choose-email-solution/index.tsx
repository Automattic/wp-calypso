import { EmailSubscription } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
	Button,
	Icon,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useEffect, useState } from 'react';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { addMailboxRoute, chooseEmailSolutionRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PriceDisplay } from '../../components/price-display';
import { Text } from '../../components/text';
import GoogleLogo from '../../images/google-logo.svg';
import {
	getMaxTitanMailboxCount,
	hasEmailForwards,
	hasGSuiteWithUs,
	hasTitanMailWithUs,
	isGoogleWorkspaceSupportedDomain,
} from '../../utils/domain';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
import { useAnnualSavings } from '../hooks/use-annual-savings';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import poweredByTitanLogo from '../resources/powered-by-titan-caps.svg';
import { IntervalLength, MailboxProvider, TitanPlanTier } from '../types';
import { getTitanTierUpgradeUrl } from '../utils/get-tier-upgrade-url';
import { getTrialMonths } from '../utils/get-trial-months';
import { isEligibleForIntroductoryOffer } from '../utils/is-eligible-for-introductory-offer';
import { isMonthlyEmailProduct } from '../utils/is-monthly-email-product';
import { getTitanTierFromSlug } from '../utils/titan-tiers';
import { ExistingForwardsNotice } from './components/existing-forwards-notice';
import { GoogleWorkspaceCard } from './components/google-workspace-card';
import { TitanPlanGrid } from './components/titan-plan-grid';

import './style.scss';

export default function ChooseEmailSolution() {
	const { domain, domainName, site } = useDomainFromUrlParam();
	const { user } = useAuth();

	const isTitanPlanSelectionEnabled = config.isEnabled( 'emails/titan-tiers' );

	const googleEmailSubscription = domain.google_apps_subscription as EmailSubscription;
	const titanEmailSubscription = domain.titan_mail_subscription as EmailSubscription;

	// When arriving with the "upgrade" intent (from the email plan purchase page),
	// keep existing Professional Email subscribers on the plan grid so they can pick
	// a higher tier instead of being redirected to the add-mailbox flow. Upgrade only
	// applies to Professional Email (Titan); Google Workspace has no tiers to upgrade.
	const { intent } = chooseEmailSolutionRoute.useSearch();
	const isUpgradeIntent = intent === 'upgrade' && hasTitanMailWithUs( domain );

	// Yearly -> monthly billing downgrade is not supported during an upgrade.
	const isUpgradingFromMonthly = isUpgradeIntent && isMonthlyEmailProduct( titanEmailSubscription );
	const showIntervalSelector = ! isUpgradeIntent || isUpgradingFromMonthly;
	const [ billingInterval, setBillingInterval ] = useState< IntervalLength >(
		isUpgradingFromMonthly ? IntervalLength.Monthly : IntervalLength.Annually
	);

	const { bestAnnualSavings } = useAnnualSavings( domain );

	const { product: googleProduct } = useEmailProduct(
		MailboxProvider.Google,
		billingInterval,
		domain
	);
	const { product: titanProduct } = useEmailProduct(
		MailboxProvider.Titan,
		billingInterval,
		domain
	);

	const canAddEmail = domain.current_user_can_add_email;

	const hasGoogleFreeTrial = isEligibleForIntroductoryOffer( {
		emailSubscription: googleEmailSubscription,
		product: googleProduct,
	} );
	const hasTitanFreeTrial = isEligibleForIntroductoryOffer( {
		emailSubscription: titanEmailSubscription,
		product: titanProduct,
	} );
	const hasFreeTrial = hasGoogleFreeTrial || hasTitanFreeTrial;

	const isTitanAvailable = canAddEmail && ! hasGSuiteWithUs( domain );

	const isGoogleAvailable =
		canAddEmail &&
		( user.is_valid_google_apps_country ?? false ) &&
		isGoogleWorkspaceSupportedDomain( domain ) &&
		! hasTitanMailWithUs( domain );

	const navigate = useNavigate();
	let redirectTo = null;
	if ( ! isUpgradeIntent && hasTitanMailWithUs( domain ) && isTitanAvailable ) {
		const subscriptionTier = getTitanTierFromSlug( titanEmailSubscription?.product_slug );
		redirectTo = {
			to: addMailboxRoute.to,
			params: {
				domain: domainName,
				provider: MailboxProvider.Titan,
				interval: isMonthlyEmailProduct( titanEmailSubscription )
					? IntervalLength.Monthly
					: IntervalLength.Annually,
			},
			search: {
				// Omit the default tier so existing Pro URLs stay unchanged.
				tier: subscriptionTier === TitanPlanTier.Pro ? undefined : subscriptionTier,
			},
		};
	} else if ( hasGSuiteWithUs( domain ) && isGoogleAvailable ) {
		redirectTo = {
			to: addMailboxRoute.to,
			params: {
				domain: domainName,
				provider: MailboxProvider.Google,
				interval: isMonthlyEmailProduct( googleEmailSubscription )
					? IntervalLength.Monthly
					: IntervalLength.Annually,
			},
		};
	}

	useEffect( () => {
		if ( redirectTo ) {
			navigate( redirectTo );
		}
	}, [ navigate, redirectTo ] );

	if ( redirectTo ) {
		return null;
	}

	// In upgrade mode, picking a higher tier goes straight to checkout with the
	// target product, keeping the existing domain, billing interval, and mailbox
	// count so the backend upgrades the current subscription in place.
	const handleTierUpgrade = ( tier: TitanPlanTier ) => {
		if ( ! site ) {
			return;
		}

		window.location.href = getTitanTierUpgradeUrl( {
			siteSlug: site.slug,
			domain: domainName,
			tier,
			interval: billingInterval,
			quantity: getMaxTitanMailboxCount( domain ),
		} );
	};

	const providers = {
		[ MailboxProvider.Titan ]: {
			logo: wordpress,
			name: __( 'Professional Email' ),
			description: __(
				'Integrated email solution with powerful features. Manage your email and more on any device.'
			),
			action: __( 'Get Professional Email' ),
			features: [
				__( 'Send and receive from your custom domain' ),
				__( '30GB storage' ),
				__( 'Email, calendar, and contacts' ),
				__( '24/7 support via email' ),
			],
			poweredBy: {
				logo: poweredByTitanLogo,
				text: __( 'Powered by Titan' ),
			},
			product: titanProduct,
			hasFreeTrial: hasTitanFreeTrial,
			available: isTitanAvailable,
			trialMonths: getTrialMonths( titanProduct ),
		},
		[ MailboxProvider.Google ]: {
			logo: <img src={ GoogleLogo } alt="" />,
			name: __( 'Google Workspace' ),
			action: __( 'Get Google Workspace' ),
			description: __(
				'Business email with Gmail. Includes other collaboration and productivity tools from Google.'
			),
			features: [
				__( 'Send and receive from your custom domain' ),
				__( '30GB storage' ),
				__( 'Email, calendar, and contacts' ),
				__( 'Video calls, docs, spreadsheets, and more' ),
				__( 'Real-time collaboration' ),
				__( 'Store and share files in the cloud' ),
				__( '24/7 support via email' ),
			],
			poweredBy: null,
			product: googleProduct,
			hasFreeTrial: isEligibleForIntroductoryOffer( {
				emailSubscription: googleEmailSubscription,
				product: googleProduct,
			} ),
			available: isGoogleAvailable,
			trialMonths: getTrialMonths( googleProduct ),
		},
	};

	const pageHeader = (
		<PageHeader
			prefix={ <Breadcrumbs length={ 2 } /> }
			title={ isUpgradeIntent ? __( 'Professional Email plans' ) : undefined }
			description={
				isUpgradeIntent
					? __( 'Explore our plans to find the right fit for your needs.' )
					: __( 'Choose between Professional Email and Google Workspace for your domain.' )
			}
		/>
	);

	const pageNotices = (
		<>
			{ ! canAddEmail && <EmailNonDomainOwnerNotice domain={ domain } /> }
			{ hasEmailForwards( domain ) && <ExistingForwardsNotice /> }
		</>
	);

	const intervalSelector = (
		<ToggleGroupControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			isBlock
			label={ __( 'Billing interval' ) }
			hideLabelFromVision
			value={ billingInterval }
			onChange={ ( newBillingInterval ) =>
				setBillingInterval( newBillingInterval as IntervalLength )
			}
		>
			<ToggleGroupControlOption label={ __( 'Monthly' ) } value={ IntervalLength.Monthly } />
			<ToggleGroupControlOption
				/* translators: %d is the annual savings percentage. */
				label={ sprintf( __( 'Annually (save up to %d%%)' ), bestAnnualSavings ) }
				value={ IntervalLength.Annually }
			/>
		</ToggleGroupControl>
	);

	return (
		<PageLayout
			header={
				// Same narrow-header/wide-content pattern as client/dashboard/sites/site-plans.
				isTitanPlanSelectionEnabled ? (
					<div className="choose-email-solution-narrow">{ pageHeader }</div>
				) : (
					pageHeader
				)
			}
			size={ isTitanPlanSelectionEnabled ? 'large' : 'small' }
			notices={
				isTitanPlanSelectionEnabled ? (
					<div className="choose-email-solution-narrow">{ pageNotices }</div>
				) : (
					pageNotices
				)
			}
		>
			{ /* Billing interval selector */ }
			{ showIntervalSelector &&
				( isTitanPlanSelectionEnabled ? (
					<div className="choose-email-solution-narrow">{ intervalSelector }</div>
				) : (
					intervalSelector
				) ) }

			{ isTitanPlanSelectionEnabled && (
				<VStack className="choose-email-solution-wide" spacing={ 6 }>
					<TitanPlanGrid
						domain={ domain }
						domainName={ domainName }
						interval={ billingInterval }
						available={ isTitanAvailable }
						currentTier={
							isUpgradeIntent
								? getTitanTierFromSlug( titanEmailSubscription?.product_slug )
								: undefined
						}
						onUpgrade={ handleTierUpgrade }
					/>
					{ ! isUpgradeIntent && (
						<GoogleWorkspaceCard
							product={ googleProduct }
							interval={ billingInterval }
							available={ isGoogleAvailable }
							hasFreeTrial={ hasGoogleFreeTrial }
							onSelect={ () =>
								navigate( {
									to: addMailboxRoute.to,
									params: {
										domain: domainName,
										provider: MailboxProvider.Google,
										interval: billingInterval,
									},
								} )
							}
						/>
					) }
				</VStack>
			) }

			{ /* Split card for providers */ }
			{ ! isTitanPlanSelectionEnabled && (
				<div className="email-providers">
					{ Object.entries( providers ).map( ( [ providerId, provider ] ) => (
						<VStack className="email-provider" key={ `provider-${ providerId }` } spacing={ 4 }>
							<Icon icon={ provider.logo } size={ 30 } className="email-provider-logo" />
							<Text as="h2" size={ 28 } lineHeight="40px" className="email-provider-name">
								{ provider.name }
							</Text>
							<Text>{ provider.description }</Text>
							<VStack
								spacing={ 2 }
								justify="flex-start"
								style={ { minHeight: hasFreeTrial ? '96px' : '76px' } }
							>
								{ provider.available ? (
									<>
										<HStack alignment="bottomLeft">
											<PriceDisplay
												price={ provider.hasFreeTrial ? 0 : provider.product?.cost ?? 0 }
												currency={ provider.product?.currency_code ?? 'USD' }
											/>
											{ provider.hasFreeTrial && (
												<PriceDisplay
													price={ provider.product?.cost ?? 0 }
													currency={ provider.product?.currency_code ?? 'USD' }
													discounted
												/>
											) }
										</HStack>
										<Text variant="muted">
											{ billingInterval === 'annually'
												? __( 'per year, per mailbox, excl. taxes.' )
												: __( 'per month, per mailbox, excl. taxes.' ) }
										</Text>
										{ provider.hasFreeTrial && (
											<div className="email-provider-trial">
												{ provider.trialMonths === 12
													? sprintf(
															/* translators: %d is the number of free trial months. */
															__( '%d month free trial' ),
															provider.trialMonths
													  )
													: __( '3 month free trial' ) }
											</div>
										) }
									</>
								) : (
									<Text size={ 20 } weight={ 500 }>
										{ __( 'Not available for this domain name' ) }
									</Text>
								) }
							</VStack>
							<Button
								className="email-provider-action"
								variant="primary"
								disabled={ ! provider.available }
								onClick={ () =>
									navigate( {
										to: addMailboxRoute.to,
										params: {
											domain: domainName,
											provider: providerId,
											interval: billingInterval,
										},
									} )
								}
							>
								{ provider.action }
							</Button>
							<ul className="email-provider-features">
								{ provider.features.map( ( feature, featureIndex ) => (
									<li key={ `feature-${ providerId }-${ featureIndex }` }>{ feature }</li>
								) ) }
							</ul>
							{ provider.poweredBy && (
								<img
									className="email-provider-powered-by"
									src={ provider.poweredBy.logo }
									alt={ provider.poweredBy.text }
								/>
							) }
						</VStack>
					) ) }
				</div>
			) }
		</PageLayout>
	);
}
