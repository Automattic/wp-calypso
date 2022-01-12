import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import EmailForwardingAddNewCompactList from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact-list';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	emailManagement,
	emailManagementAddEmailForwards,
	emailManagementPurchaseNewEmailAccount,
} from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmailForwardsAddProps = {
	selectedDomainName: string;
	source?: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (): void => {};

const EmailForwardsAdd = ( { selectedDomainName, source }: EmailForwardsAddProps ): JSX.Element => {
	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );

	const hasLoadedDomains = useSelector( ( state ) =>
		hasLoadedSiteDomains( state, selectedSite?.ID ?? null )
	);
	const requestingSiteDomains = useSelector( ( state ) =>
		Boolean( selectedSite && isRequestingSiteDomains( state, selectedSite.ID ) )
	);
	const areDomainsLoading = requestingSiteDomains || ! hasLoadedDomains;

	const translate = useTranslate();

	const goToEmail = useCallback( (): void => {
		if ( ! selectedSite ) {
			return;
		}

		if ( source === 'purchase' ) {
			page(
				emailManagementPurchaseNewEmailAccount(
					selectedSite.slug,
					selectedDomainName,
					currentRoute
				)
			);
			return;
		}

		page( emailManagement( selectedSite.slug, selectedDomainName, currentRoute ) );
	}, [ currentRoute, selectedDomainName, selectedSite, source ] );

	const onAddEmailForwardSuccess = useCallback( () => {
		if ( ! selectedSite ) {
			return;
		}

		page( emailManagement( selectedSite.slug, selectedDomainName, currentRoute ) );
	}, [ currentRoute, selectedDomainName, selectedSite ] );

	const analyticsPath = emailManagementAddEmailForwards( ':site', ':domain', currentRoute );

	return (
		<div className="email-forwards-add">
			<PageViewTracker path={ analyticsPath } title="Email Management > Add Email Forwards" />

			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout={ true }>
				<DocumentHead title={ translate( 'Add New Email Forwards' ) } />

				<EmailHeader />

				<HeaderCake onClick={ goToEmail }>
					{ translate( 'Email Forwarding' ) + ': ' + selectedDomainName }
				</HeaderCake>

				<SectionHeader label={ translate( 'Add New Email Forwards' ) } />

				<Card>
					{ areDomainsLoading && (
						<div className="email-forwards-add__placeholder">
							<p />
							<p />
							<Button disabled />
						</div>
					) }

					{ ! areDomainsLoading && (
						<EmailForwardingAddNewCompactList
							onAddEmailForwardSuccess={ onAddEmailForwardSuccess }
							onConfirmEmailForwarding={ noop }
							selectedDomainName={ selectedDomainName }
						/>
					) }
				</Card>
			</Main>
		</div>
	);
};

export default EmailForwardsAdd;
