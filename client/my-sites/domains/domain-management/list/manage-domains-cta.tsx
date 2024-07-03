import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { domainManagementRoot } from 'calypso/my-sites/domains/paths';

export const ManageAllDomainsCTA = ( { shouldDisplaySeparator = true } ) => {
	const translate = useTranslate();

	return (
		<div
			className={ clsx( 'domain-management__all-domains-section', {
				separator: shouldDisplaySeparator,
			} ) }
		>
			<p css={ { marginBottom: '1rem', textAlign: 'center' } }>
				{ translate( 'Manage all the domains you own on WordPress.com' ) }
			</p>
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
		</div>
	);
};
