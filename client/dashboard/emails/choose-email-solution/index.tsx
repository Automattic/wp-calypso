import { EmailSubscription } from '@automattic/api-core';
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
import { addMailboxRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PriceDisplay } from '../../components/price-display';
import { Text } from '../../components/text';
import GoogleLogo from '../../images/google-logo.svg';
import {
	hasEmailForwards,
	hasGSuiteWithUs,
	hasTitanMailWithUs,
	isGoogleWorkspaceSupportedDomain,
} from '../../utils/domain';
import { BackToEmailsPrefix } from '../components/back-to-emails-prefix';
import { EmailNonDomainOwnerNotice } from '../components/email-non-domain-owner-notice';
import { useAnnualSavings } from '../hooks/use-annual-savings';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import poweredByTitanLogo from '../resources/powered-by-titan-caps.svg';
import { IntervalLength, MailboxProvider } from '../types';
import { isEligibleForIntroductoryOffer } from '../utils/is-eligible-for-introductory-offer';
import { isMonthlyEmailProduct } from '../utils/is-monthly-email-product';
import { ExistingForwardsNotice } from './components/existing-forwards-notice';

import './style.scss';

export default function ChooseEmailSolution() {
	const { domain, domainName } = useDomainFromUrlParam();

	const [ billingInterval, setBillingInterval ] = useState< IntervalLength >(
		IntervalLength.Annually
	);

	const { bestAnnualSavings } = useAnnualSavings();

	const { product: googleProduct } = useEmailProduct( MailboxProvider.Google, billingInterval );
	const { product: titanProduct } = useEmailProduct( MailboxProvider.Titan, billingInterval );

	const canAddEmail = domain.current_user_can_add_email;

	const googleEmailSubscription = domain.google_apps_subscription as EmailSubscription;
	const titanEmailSubscription = domain.titan_mail_subscription as EmailSubscription;

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

	const { user } = useAuth();
	const isGoogleAvailable =
		canAddEmail &&
		( user.is_valid_google_apps_country ?? false ) &&
		isGoogleWorkspaceSupportedDomain( domain ) &&
		! hasTitanMailWithUs( domain );

	const navigate = useNavigate();
	let redirectTo = null;
	if ( hasTitanMailWithUs( domain ) && isTitanAvailable ) {
		redirectTo = {
			to: addMailboxRoute.to,
			params: {
				domain: domainName,
				provider: MailboxProvider.Titan,
				interval: isMonthlyEmailProduct( titanEmailSubscription )
					? IntervalLength.Monthly
					: IntervalLength.Annually,
			},
		};
	} else if ( hasGSuiteWithUs( domain ) && isGoogleAvailable ) {
		redirectTo = {
			to: addMailboxRoute.to,
			params: {
				domainName: domainName,
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
		},
	};

	return (
		<PageLayout
			header={
				<PageHeader
					prefix={ <BackToEmailsPrefix /> }
					description={ __(
						'Choose between Professional Email and Google Workspace for your domain.'
					) }
				/>
			}
			size="small"
			notices={
				<>
					{ ! canAddEmail && <EmailNonDomainOwnerNotice domain={ domain } /> }
					{ hasEmailForwards( domain ) && <ExistingForwardsNotice /> }
				</>
			}
		>
			{ /* Billing interval selector */ }
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

			{ /* Split card for providers */ }
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
										<div className="email-provider-trial">{ __( '3 month free trial' ) }</div>
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
										domainName: domainName,
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
		</PageLayout>
	);
}
