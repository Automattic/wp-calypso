import { __ } from '@wordpress/i18n';
import { wpcomLink } from '../../utils/link';
import EmptyDomainsStateLayout from './layout';

export default function EmptyDomainsState() {
	return (
		<EmptyDomainsStateLayout
			dashboard="msd"
			searchDomainNameLink={ wpcomLink( '/start/domain' ) }
			bringDomainNameTitle={ __( 'Transfer a domain you already own' ) }
			bringDomainNameDescription={ __(
				'Move your domain to WordPress.com and manage everything in one place.'
			) }
			bringDomainNameLink={ wpcomLink( '/setup/domain-transfer' ) }
			bringDomainNameCTA={ __( 'Start transfer' ) }
		/>
	);
}
