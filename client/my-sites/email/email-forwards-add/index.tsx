import page from '@automattic/calypso-router';
import { Button, Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteDomains from 'calypso/components/data/query-site-domains';
import HeaderCake from 'calypso/components/header-cake';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import SectionHeader from 'calypso/components/section-header';
import { getCurrentUserCannotAddEmailReason, getSelectedDomain } from 'calypso/lib/domains';
import { EMAIL_WARNING_CODE_GRAVATAR_DOMAIN } from 'calypso/lib/emails/email-provider-constants';
import EmailForwardingAddNewCompactList from 'calypso/my-sites/email/email-forwarding/email-forwarding-add-new-compact-list';
import EmailHeader from 'calypso/my-sites/email/email-header';
import {
	getEmailManagementPath,
	getPurchaseNewEmailAccountPath,
} from 'calypso/my-sites/email/paths';
import { useSelector } from 'calypso/state';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import {
	getDomainsBySiteId,
	hasLoadedSiteDomains,
	isRequestingSiteDomains,
} from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

type EmailForwardsAddProps = {
	selectedDomainName: string;
	source?: string;
	showFormHeader?: boolean;
	showPageHeader?: boolean;
};

const EmailForwardsAdd = ( {
	selectedDomainName,
	source,
	showFormHeader = false,
	showPageHeader = true,
}: EmailForwardsAddProps ) => {
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

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );
	const selectedDomain = getSelectedDomain( { domains, selectedDomainName } );
	const cannotAddEmailWarningReason = getCurrentUserCannotAddEmailReason( selectedDomain );
	const isGravatarDomain = cannotAddEmailWarningReason?.code === EMAIL_WARNING_CODE_GRAVATAR_DOMAIN;

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

	const content = isGravatarDomain ? (
		<Notice showDismiss={ false } className="email-forwards-add__notice">
			{ translate(
				'This domain is associated with a Gravatar profile and cannot be used for email services at this time.'
			) }
		</Notice>
	) : (
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
					selectedDomainName={ selectedDomainName }
					showFormHeader={ showFormHeader }
				/>
			) }
		</Card>
	);

	return (
		<>
			<QueryProductsList />

			{ selectedSite && <QuerySiteDomains siteId={ selectedSite.ID } /> }

			<Main wideLayout className="email-forwards-add">
				<DocumentHead title={ translate( 'Add New Email Forwards' ) } />

				{ showPageHeader && (
					<>
						<EmailHeader />

						<HeaderCake onClick={ goToEmail }>
							{ translate( 'Email Forwarding' ) + ': ' + selectedDomainName }
						</HeaderCake>

						<SectionHeader label={ translate( 'Add New Email Forwards' ) } />
					</>
				) }

				{ content }
			</Main>
		</>
	);
};

export default EmailForwardsAdd;
