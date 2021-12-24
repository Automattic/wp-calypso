import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState } from 'react';
import { useSelector } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import Main from 'calypso/components/main';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasGSuiteSupportedDomain } from 'calypso/lib/gsuite';
import { BillingIntervalToggle } from 'calypso/my-sites/email/email-providers-stacked-comparison/billing-interval-toggle';
import GoogleWorkspaceCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/google-workspace-card';
import ProfessionalEmailCard from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/professional-email-card';
import { IntervalLength } from 'calypso/my-sites/email/email-providers-stacked-comparison/provider-cards/utils';
import { emailManagementInDepthComparison } from 'calypso/my-sites/email/paths';
import canUserPurchaseGSuite from 'calypso/state/selectors/can-user-purchase-gsuite';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmailProvidersStackedComparisonProps = {
	comparisonContext: string;
	selectedDomainName: string;
	siteName: string;
	source: string;
};

const EmailProvidersStackedComparison: FunctionComponent< EmailProvidersStackedComparisonProps > = (
	props
) => {
	const { comparisonContext, siteName, source } = props;

	const translate = useTranslate();

	const [ intervalLength, setIntervalLengthPure ] = useState( IntervalLength.ANNUALLY );

	const [ detailsExpanded, setDetailsExpanded ] = useState( {
		titan: true,
		google: false,
	} );

	const canPurchaseGoogleWorkspace = useSelector( canUserPurchaseGSuite );

	const selectedSite = useSelector( getSelectedSite );
	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const domain = getSelectedDomain( {
		domains,
		selectedDomainName: props.selectedDomainName,
	} );

	if ( ! domain ) {
		return null;
	}

	const resolvedDomainName = domain ? domain.name : props.selectedDomainName;

	const isGSuiteSupported =
		canPurchaseGoogleWorkspace && resolvedDomainName && hasGSuiteSupportedDomain( [ domain ] );

	const onExpandedStateChange = ( providerKey: string, isCurrentlyExpanded: boolean ) => {
		const expandedEntries = Object.entries( detailsExpanded ).map( ( entry ) => {
			const [ key, currentExpanded ] = entry;
			if ( isCurrentlyExpanded ) {
				return [ key, key === providerKey ];
			}
			return [ key, key === providerKey ? isCurrentlyExpanded : currentExpanded ];
		} );

		if ( isCurrentlyExpanded ) {
			recordTracksEvent( 'calypso_email_providers_expand_section_click', {
				provider: providerKey,
			} );
		}

		setDetailsExpanded( Object.fromEntries( expandedEntries ) );
	};

	const setIntervalLength = ( interval: IntervalLength ) => {
		if ( intervalLength === IntervalLength.ANNUALLY ) {
			setDetailsExpanded( { google: false, titan: true } );
		}
		setIntervalLengthPure( interval );
	};

	const showGoogleWorkspaceCard = intervalLength === IntervalLength.ANNUALLY && isGSuiteSupported;

	return (
		<Main className="email-providers-stacked-comparison__main" wideLayout>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<h1 className="email-providers-stacked-comparison__header wp-brand-font">
				{ translate( 'Pick an email solution' ) }
			</h1>

			<div className="email-providers-stacked-comparison__how-they-compare">
				{ translate( 'Not sure how to start? {{a}}See how they compare{{/a}}.', {
					components: {
						a: (
							<a
								href={ emailManagementInDepthComparison( siteName, resolvedDomainName as string ) }
							/>
						),
					},
				} ) }
			</div>

			<BillingIntervalToggle
				onIntervalChange={ setIntervalLength }
				intervalLength={ intervalLength }
			/>

			<ProfessionalEmailCard
				comparisonContext={ comparisonContext }
				detailsExpanded={ detailsExpanded.titan }
				selectedDomainName={ resolvedDomainName as string }
				source={ source }
				intervalLength={ intervalLength }
				onExpandedChange={ onExpandedStateChange }
			/>

			{ showGoogleWorkspaceCard && (
				<GoogleWorkspaceCard
					comparisonContext={ comparisonContext }
					detailsExpanded={ detailsExpanded.google }
					selectedDomainName={ resolvedDomainName }
					source={ source }
					intervalLength={ intervalLength }
					onExpandedChange={ onExpandedStateChange }
				/>
			) }
		</Main>
	);
};

export default EmailProvidersStackedComparison;
