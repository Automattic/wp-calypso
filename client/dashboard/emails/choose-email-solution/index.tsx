import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Button,
	Icon,
	Card,
	CardMedia,
} from '@wordpress/components';
import { sprintf, __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useState } from 'react';
import poweredByTitanLogo from '../../../assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { useAuth } from '../../app/auth';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PriceDisplay } from '../../components/price-display';
import { Text } from '../../components/text';
import GoogleLogo from '../../images/google-logo.svg';
import { isGoogleWorkspaceSupportedDomain } from '../../utils/domain';
import { useAnnualSavings } from '../hooks/use-annual-savings';
import { useDomainFromUrlParam } from '../hooks/use-domain-from-url-param';
import { useEmailProduct } from '../hooks/use-email-product';
import { IntervalLength } from '../types';

import './style.scss';

export default function ChooseEmailSolution() {
	const { domain, domainName, isLoadingDomain } = useDomainFromUrlParam();

	const [ billingInterval, setBillingInterval ] = useState( 'annually' as IntervalLength );

	const { bestAnnualSavings } = useAnnualSavings();

	const { product: googleProduct } = useEmailProduct( 'google', billingInterval );
	const { product: titanProduct } = useEmailProduct( 'titan', billingInterval );

	const hasTitanFreeTrial =
		( domain?.titan_mail_subscription?.is_eligible_for_introductory_offer ?? false ) &&
		titanProduct.introductory_offer?.cost_per_interval === 0;

	const { user } = useAuth();
	const isGoogleSupported =
		( user.is_valid_google_apps_country ?? false ) &&
		domain &&
		isGoogleWorkspaceSupportedDomain( domain );

	const providers = [
		{
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
			available: true,
		},
		{
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
			product: googleProduct,
			available: isGoogleSupported,
		},
	];

	if ( ! domain && ! isLoadingDomain ) {
		return (
			<PageLayout size="small">
				<Card>
					<CardMedia>
						<div
							style={ {
								background: 'var(--dashboard__background-color-error)',
								color: '#fff',
								padding: 16,
							} }
						>
							{
								/* translators: %s is the domain name. */
								sprintf( __( 'You cannot add a mailbox to %s.' ), domainName )
							}
						</div>
					</CardMedia>
				</Card>
			</PageLayout>
		);
	}

	return (
		<PageLayout header={ <PageHeader /> } size="small">
			{ /* Billing interval selector */ }
			<div className="billing-interval-selector">
				<ToggleGroupControl
					__next40pxDefaultSize
					__nextHasNoMarginBottom
					isBlock
					label={ __( 'Billing interval' ) }
					hideLabelFromVision
					value={ billingInterval }
					onChange={ ( newBillingInterval ) =>
						setBillingInterval( newBillingInterval as BillingInterval )
					}
				>
					<ToggleGroupControlOption label={ __( 'Monthly' ) } value="monthly" />
					<ToggleGroupControlOption
						/* translators: %d is the annual savings percentage. */
						label={ sprintf( __( 'Annually (save up to %d%%)' ), bestAnnualSavings ) }
						value="annually"
					/>
				</ToggleGroupControl>
			</div>

			{ /* Split card for providers */ }
			<div className="email-providers">
				{ providers.map( ( provider, providerIndex ) => (
					<VStack className="email-provider" key={ `provider-${ providerIndex }` } spacing={ 4 }>
						<Icon icon={ provider.logo } size={ 30 } className="email-provider-logo" />
						<Text as="h2" size={ 28 } lineHeight="40px" className="email-provider-name">
							{ provider.name }
						</Text>
						<Text>{ provider.description }</Text>
						<VStack
							spacing={ 2 }
							justify="flex-start"
							style={ { minHeight: hasTitanFreeTrial ? '96px' : '76px' } }
						>
							{ provider.available ? (
								<>
									<HStack expanded={ false } alignment="bottomLeft">
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
						>
							{ provider.action }
						</Button>
						<ul className="email-provider-features">
							{ provider.features.map( ( feature, featureIndex ) => (
								<li key={ `feature-${ providerIndex }-${ featureIndex }` }>{ feature }</li>
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
