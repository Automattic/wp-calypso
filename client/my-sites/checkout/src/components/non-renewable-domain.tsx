import page from '@automattic/calypso-router';
import { Button, CheckoutStepBody } from '@automattic/composite-checkout';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { domainAddNew } from 'calypso/my-sites/domains/paths';
import { useSelector, useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

export function NonRenewableDomain() {
	const reduxDispatch = useDispatch();
	useEffect( () => {
		reduxDispatch( recordTracksEvent( 'calypso_checkout_non_renewable_domain' ) );
	}, [ reduxDispatch ] );

	return (
		<CheckoutStepBody
			stepId="non-renewable-domain"
			isStepActive={ false }
			isStepComplete
			titleContent={ <NonRenewableDomainTitle /> }
			completeStepContent={ <NonRenewableDomainExplanation /> }
		/>
	);
}

function NonRenewableDomainTitle() {
	const translate = useTranslate();
	return <>{ String( translate( 'This domain can no longer be renewed' ) ) }</>;
}

function NonRenewableDomainExplanation() {
	const translate = useTranslate();
	return (
		<>
			{ translate(
				'Both the renewal period and the redemption period for this domain have ended, so there is nothing left to renew. It will be released back to the domain registry, after which anyone may be able to register it. You can search for another domain in the meantime.'
			) }
		</>
	);
}

/**
 * Sends the customer to domain search, which is the only thing left they can do
 * about this domain.
 */
export function SearchForNewDomainButton() {
	const translate = useTranslate();
	const reduxDispatch = useDispatch();
	const siteSlug = useSelector( getSelectedSiteSlug );

	return (
		<Button
			buttonType="primary"
			fullWidth
			onClick={ () => {
				reduxDispatch( recordTracksEvent( 'calypso_checkout_non_renewable_domain_search_click' ) );
				page( domainAddNew( siteSlug ) );
			} }
		>
			{ translate( 'Search for a new domain' ) }
		</Button>
	);
}
