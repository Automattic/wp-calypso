import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';

export default function ManageAllDomainsButton() {
	const translate = useTranslate();

	return (
		<Button
			className="domain-management__all-domains-link"
			href={ domainManagementRoot() }
			key="breadcrumb_see_all_domains_link"
			onClick={ () => {
				recordTracksEvent( 'calypso_domain_management_see_all_domains_link_click' );
			} }
		>
			{ translate( 'Manage all domains' ) }
		</Button>
	);
}
