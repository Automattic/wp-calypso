import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { GOOGLE_WORKSPACE_PRODUCT_TYPE } from 'calypso/lib/gsuite/constants';
import { domainAddEmailUpsell } from 'calypso/my-sites/domains/paths';
import EmailExistingForwardsNotice from 'calypso/my-sites/email/email-existing-forwards-notice';
import EmailExistingPaidServiceNotice from 'calypso/my-sites/email/email-existing-paid-service-notice';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-comparison/billing-interval-toggle';
import EmailForwardingLink from 'calypso/my-sites/email/email-providers-comparison/email-forwarding-link';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-comparison/interval-length';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import {
	emailManagementInDepthComparison,
	emailManagementPurchaseNewEmailAccount,
} from 'calypso/my-sites/email/paths';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsWithForwards } from 'calypso/state/selectors/get-email-forwards';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export type EmailProvidersStackedComparisonProps = {
	cartDomainName?: string;
	comparisonContext: string;
	isDomainInCart?: boolean;
	onIntervalLengthChange?: (
		props: EmailProvidersStackedComparisonProps,
		newIntervalLength: IntervalLength
	) => void;
	selectedDomainName: string;
	selectedEmailProviderSlug?: string;
	selectedIntervalLength?: IntervalLength;
	source: string;
};

const EmailProvidersStackedComparison = (
	props: EmailProvidersStackedComparisonProps
): JSX.Element | null => {
	const {
		comparisonContext,
		isDomainInCart = false,
		onIntervalLengthChange = noop,
		selectedDomainName,
		selectedEmailProviderSlug,
		selectedIntervalLength = IntervalLength.ANNUALLY,
		source,
	} = props;
	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ detailsExpanded, setDetailsExpanded ] = useState( () => {
		if ( selectedEmailProviderSlug === GOOGLE_WORKSPACE_PRODUCT_TYPE ) {
			return {
				titan: false,
				google: true,
			};
		}

		return {
			titan: true,
			google: false,
		};
	} );

	const currentRoute = useSelector( getCurrentRoute );

	const selectedSite = useSelector( getSelectedSite );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: selectedDomainName,
	} );
	const domainsWithForwards = useSelector( ( state ) => getDomainsWithForwards( state, domains ) );

	const changeExpandedState = ( providerKey: string, isCurrentlyExpanded: boolean ) => {
		const expandedEntries = Object.entries( detailsExpanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;

			if ( isCurrentlyExpanded ) {
				return [ key, key === providerKey ];
			}

			return [ key, key === providerKey ? isCurrentlyExpanded : currentExpanded ];
		} );

		if ( isCurrentlyExpanded ) {
			dispatch(
				recordTracksEvent( 'calypso_email_providers_expand_section_click', {
					provider: providerKey,
				} )
			);
		}

		setDetailsExpanded( Object.fromEntries( expandedEntries ) );
	};

	const changeIntervalLength = ( newIntervalLength: IntervalLength ) => {
		if ( ! selectedSite?.slug ) {
			return;
		}

		dispatch(
			recordTracksEvent( 'calypso_email_providers_billing_interval_toggle_click', {
				domain_name: selectedDomainName,
				new_interval: newIntervalLength,
			} )
		);

		onIntervalLengthChange( props, newIntervalLength );
	};

	const handleCompareClick = () => {
		dispatch(
			recordTracksEvent( 'calypso_email_providers_compare_link_click', {
				domain_name: selectedDomainName,
				interval: selectedIntervalLength,
			} )
		);
	};

	if ( ! domain && ! isDomainInCart ) {
		return null;
	}

	const hasExistingEmailForwards = ! isDomainInCart && hasEmailForwards( domain );

	return (
		<Main wideLayout>
			<QueryProductsList />

			{ ! isDomainInCart && <QueryEmailForwards domainName={ selectedDomainName } /> }

			{ ! isDomainInCart && selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header">
				{ translate( 'Pick an email solution' ) }
			</h1>

			{ selectedSite && (
				<div className="email-providers-stacked-comparison__sub-header">
					{ translate( 'Not sure where to start? {{a}}See how they compare{{/a}}.', {
						components: {
							a: (
								<a
									href={ emailManagementInDepthComparison(
										selectedSite.slug,
										selectedDomainName,
										currentRoute,
										null,
										selectedIntervalLength
									) }
									onClick={ handleCompareClick }
								/>
							),
						},
					} ) }
				</div>
			) }

			<BillingIntervalToggle
				intervalLength={ selectedIntervalLength }
				onIntervalChange={ changeIntervalLength }
			/>

			{ hasExistingEmailForwards && domainsWithForwards !== undefined && (
				<EmailExistingForwardsNotice
					domainsWithForwards={ domainsWithForwards }
					selectedDomainName={ selectedDomainName }
				/>
			) }

			{ ! isDomainInCart && domain && <EmailExistingPaidServiceNotice domain={ domain } /> }

			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				detailsExpanded={ detailsExpanded.titan }
				intervalLength={ selectedIntervalLength }
				isDomainInCart={ isDomainInCart }
				onExpandedChange={ changeExpandedState }
				selectedDomainName={ selectedDomainName }
				source={ source }
			/>

			<GoogleWorkspaceCard
				comparisonContext={ comparisonContext }
				detailsExpanded={ detailsExpanded.google }
				intervalLength={ selectedIntervalLength }
				isDomainInCart={ isDomainInCart }
				onExpandedChange={ changeExpandedState }
				selectedDomainName={ selectedDomainName }
				source={ source }
			/>

			{ ! isDomainInCart && <EmailForwardingLink selectedDomainName={ selectedDomainName } /> }

			<TrackComponentView
				eventName="calypso_email_providers_comparison_page_view"
				eventProperties={ {
					context: comparisonContext,
					interval: selectedIntervalLength,
					layout: 'stacked',
					provider: selectedEmailProviderSlug,
					source,
				} }
			/>
		</Main>
	);
};

export default EmailProvidersStackedComparison;
