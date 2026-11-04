import { useNavigate } from '@tanstack/react-router';
import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { useAnalytics } from '../../app/analytics';
import { useAuth } from '../../app/auth';
import Breadcrumbs from '../../app/breadcrumbs';
import { chooseDomainRoute } from '../../app/router/emails';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { GoogleWorkspaceCard } from '../choose-email-solution/components/google-workspace-card';
import { TitanPlanGrid } from '../choose-email-solution/components/titan-plan-grid';
import { useAnnualSavings } from '../hooks/use-annual-savings';
import { useEmailProduct } from '../hooks/use-email-product';
import { IntervalLength, MailboxProvider, TitanPlanTier } from '../types';

import '../choose-email-solution/style.scss';

/**
 * Shows the email plans before a domain is picked. Prices come from the global
 * products list, so domain-specific offers like free trials only show up once
 * the user picks a domain.
 */
export default function ChooseEmailPlan() {
	const { user } = useAuth();
	const navigate = useNavigate();
	const { recordTracksEvent } = useAnalytics();

	const [ billingInterval, setBillingInterval ] = useState< IntervalLength >(
		IntervalLength.Annually
	);
	const { bestAnnualSavings } = useAnnualSavings();
	const { product: googleProduct } = useEmailProduct( MailboxProvider.Google, billingInterval );

	const selectPlan = ( provider: MailboxProvider, tier?: TitanPlanTier ) => {
		recordTracksEvent( 'calypso_dashboard_emails_choose_email_plan_click', {
			provider,
			tier,
			interval: billingInterval,
		} );

		navigate( {
			to: chooseDomainRoute.fullPath,
			search: { provider, interval: billingInterval, tier },
		} );
	};

	return (
		<PageLayout
			header={
				<div className="choose-email-solution-narrow">
					<PageHeader
						prefix={ <Breadcrumbs length={ 2 } /> }
						title={ __( 'Email plans' ) }
						description={ __(
							'Choose between Professional Email and Google Workspace, then pick a domain.'
						) }
					/>
				</div>
			}
			size="large"
		>
			<div className="choose-email-solution-narrow">
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
			</div>
			<VStack className="choose-email-solution-wide" spacing={ 6 }>
				<TitanPlanGrid
					domainName=""
					interval={ billingInterval }
					available
					onSelect={ ( tier ) => selectPlan( MailboxProvider.Titan, tier ) }
				/>
				<GoogleWorkspaceCard
					product={ googleProduct }
					interval={ billingInterval }
					available={ user.is_valid_google_apps_country ?? false }
					hasFreeTrial={ false }
					onSelect={ () => selectPlan( MailboxProvider.Google ) }
				/>
			</VStack>
		</PageLayout>
	);
}
