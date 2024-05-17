import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import SectionHeader from 'calypso/components/section-header';
import EmailForwardingAddNewCompactList from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact-list';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	getEmailManagementPath,
	getPurchaseNewEmailAccountPath,
} from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
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

const EmailForwardsAdd = ( { selectedDomainName, source }: EmailForwardsAddProps ) => {
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
			page( getPurchaseNewEmailAccountPath( selectedSite.slug, selectedDomainName, currentRoute ) );
			return;
		}

		page( getEmailManagementPath( selectedSite.slug, selectedDomainName, currentRoute ) );
	}, [ currentRoute, selectedDomainName, selectedSite, source ] );

	const onAddedEmailForwards = useCallback( () => {
		if ( ! selectedSite ) {
			return;
		}

		page( getEmailManagementPath( selectedSite.slug, selectedDomainName, currentRoute ) );
	}, [ currentRoute, selectedDomainName, selectedSite ] );

	return (
		<div className="email-forwards-add">
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout>
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
							onAddedEmailForwards={ onAddedEmailForwards }
							onBeforeAddEmailForwards={ noop }
							selectedDomainName={ selectedDomainName }
						/>
					) }
				</Card>
			</Main>
		</div>
	);
};

export default EmailForwardsAdd;
