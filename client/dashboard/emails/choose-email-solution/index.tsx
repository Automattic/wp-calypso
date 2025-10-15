import { TitanMailSlugs, GoogleWorkspaceSlugs } from '@automattic/api-core';
import { productsQuery } from '@automattic/api-queries';
import { formatCurrency } from '@automattic/number-formatters';
import { useQuery } from '@tanstack/react-query';
import {
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Button,
	Icon,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { wordpress } from '@wordpress/icons';
import { useState } from 'react';
import poweredByTitanLogo from '../../../assets/images/email-providers/titan/powered-by-titan-caps.svg';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { Text } from '../../components/text';
import GoogleLogo from '../../images/google-logo.svg';

import './style.scss';

export default function ChooseEmailSolution() {
	const [ billingInterval, setBillingInterval ] = useState( 'annual' as 'monthly' | 'annual' );

	const { data: products } = useQuery( productsQuery() );
	const titanProductSlug =
		billingInterval === 'annual'
			? TitanMailSlugs.TITAN_MAIL_YEARLY_SLUG
			: TitanMailSlugs.TITAN_MAIL_MONTHLY_SLUG;
	const googleProductSlug =
		billingInterval === 'annual'
			? GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY
			: GoogleWorkspaceSlugs.GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY;

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
			product: products[ titanProductSlug ],
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
			product: products[ googleProductSlug ],
		},
	];

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
						setBillingInterval( newBillingInterval as 'monthly' | 'annual' )
					}
				>
					<ToggleGroupControlOption label={ __( 'Monthly' ) } value="monthly" />
					<ToggleGroupControlOption label={ __( 'Annually (Save xx%)' ) } value="annual" />
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
						<VStack spacing={ 2 }>
							<Text size={ 22 } weight={ 600 }>
								{ formatCurrency( provider.product.cost, provider.product.currency_code, {
									stripZeros: true,
								} ) }
							</Text>
							<Text variant="muted">
								{ billingInterval === 'annual'
									? __( 'per year, per mailbox, excl. taxes.' )
									: __( 'per month, per mailbox, excl. taxes.' ) }
							</Text>
						</VStack>
						<Button className="email-provider-action" variant="primary">
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
