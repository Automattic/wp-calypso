import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryEmailForwards from 'calypso/components/data/query-email-forwards';
import { getSelectedDomain } from 'calypso/lib/domains';
import { hasEmailForwards } from 'calypso/lib/domains/email-forwarding';
import { emailManagementAddEmailForwards } from 'calypso/my-sites/email/paths';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import type { ReactElement } from 'react';

import './style.scss';

type EmailForwardingLinkProps = {
	selectedDomainName: string;
};

const EmailForwardingLink = ( {
	selectedDomainName,
}: EmailForwardingLinkProps ): ReactElement | null => {
	const translate = useTranslate();

	const currentRoute = useSelector( getCurrentRoute );
	const selectedSite = useSelector( getSelectedSite );

	const domains = useSelector( ( state ) => getDomainsBySiteId( state, selectedSite?.ID ) );

	const domain = getSelectedDomain( {
		domains,
		selectedDomainName,
	} );

	if ( ! domain || ! selectedSite ) {
		return null;
	}

	const hasExistingEmailForwards = hasEmailForwards( domain );

	if ( hasExistingEmailForwards ) {
		return null;
	}

	return (
		<div className="email-forwarding-link">
			<QueryEmailForwards domainName={ selectedDomainName } />

			{ translate( 'Looking for a free email solution? Start with {{a}}Email Forwarding{{/a}}.', {
				components: {
					a: (
						<a
							href={ emailManagementAddEmailForwards(
								selectedSite.slug,
								selectedDomainName,
								currentRoute,
								'purchase'
							) }
						/>
					),
				},
			} ) }
		</div>
	);
};

export default EmailForwardingLink;
