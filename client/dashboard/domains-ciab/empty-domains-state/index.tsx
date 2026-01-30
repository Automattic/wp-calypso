import { __ } from '@wordpress/i18n';
import EmptyDomainsStateLayout from '../../domains/empty-domains-state/layout';
import { wpcomLink } from '../../utils/link';

export default function EmptyDomainsState() {
	return (
		<EmptyDomainsStateLayout
			dashboard="ciab"
			searchDomainNameLink={ wpcomLink( '/setup/domain' ) }
			bringDomainNameTitle={ __( 'Use a domain name you already own' ) }
			bringDomainNameDescription={ __(
				'Bring your domain to WordPress.com and manage everything in one place.'
			) }
			bringDomainNameLink={ wpcomLink( '/setup/domain/use-my-domain' ) }
			bringDomainNameCTA={ __( 'Use a domain name I own' ) }
		/>
	);
}
