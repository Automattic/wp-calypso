/* eslint-disable wpcalypso/jsx-classname-namespace */

import { useShoppingCart } from '@automattic/shopping-cart';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { stringify } from 'qs';
import { useDispatch, useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { hasDomainInCart } from 'calypso/lib/cart-values/cart-items';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import EmailForwardingLink from 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link';
import ComparisonList from 'calypso/my-sites/email/email-providers-comparison/in-depth/comparison-list';
import ComparisonTable from 'calypso/my-sites/email/email-providers-comparison/in-depth/comparison-table';
import {
	professionalEmailFeatures,
	googleWorkspaceFeatures,
} from 'calypso/my-sites/email/email-providers-comparison/in-depth/data';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import { emailManagementInDepthComparison } from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { EmailProvidersInDepthComparisonProps } from 'calypso/my-sites/email/email-providers-comparison/in-depth/types';

import './style.scss';

const EmailProvidersInDepthComparison = ( {
	referrer,
	selectedDomainName,
	selectedIntervalLength = IntervalLength.ANNUALLY,
}: EmailProvidersInDepthComparisonProps ): JSX.Element => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const isMobile = useMobileBreakpoint();

	const selectedSite = useSelector( getSelectedSite );
	const cartKey = useCartKey();
	const shoppingCartManager = useShoppingCart( cartKey );
	const isDomainInCart = hasDomainInCart( shoppingCartManager.responseCart, selectedDomainName );

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		if ( selectedSite === null ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_email_providers_in_depth_billing_interval_toggle_click', {
				domain_name: selectedDomainName,
				new_interval: newIntervalLength,
			} )
		);

		page(
			emailManagementInDepthComparison(
				selectedSite.slug,
				selectedDomainName,
				referrer,
				null,
				newIntervalLength
			)
		);
	};

	const selectEmailProvider = ( emailProviderSlug: string ) => {
		if ( selectedSite === null ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_email_providers_in_depth_select_provider_click', {
				domain_name: selectedDomainName,
				provider: emailProviderSlug,
			} )
		);
		const path = `${ referrer }?${ stringify( {
			interval: selectedIntervalLength,
			provider: emailProviderSlug,
		} ) }`;

		page( path );
	};

	const ComparisonComponent = isMobile ? ComparisonList : ComparisonTable;

	return (
		<Main wideLayout>
			<PageViewTracker
				path={ emailManagementInDepthComparison( ':site', ':domain' ) }
				title="Email Comparison > In-Depth Comparison"
			/>

			<QueryProductsList />

			<h1 className="email-providers-in-depth-comparison__header">
				{ translate( 'Choose the right plan for you' ) }
			</h1>

			<div className="email-providers-in-depth-comparison__sub-header">
				{ translate( 'Try risk-free with a 14-day money back guarantee on all plans.' ) }
			</div>

			<BillingIntervalToggle
				intervalLength={ selectedIntervalLength }
				onIntervalChange={ changeIntervalLength }
			/>

			<ComparisonComponent
				emailProviders={ [ professionalEmailFeatures, googleWorkspaceFeatures ] }
				intervalLength={ selectedIntervalLength }
				onSelectEmailProvider={ selectEmailProvider }
				selectedDomainName={ selectedDomainName }
				isDomainInCart={ isDomainInCart }
			/>

			<EmailForwardingLink selectedDomainName={ selectedDomainName } />
		</Main>
	);
};

export default EmailProvidersInDepthComparison;
