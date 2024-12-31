import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';
import ExternalLink from 'calypso/components/external-link';
import NavigationHeader from 'calypso/components/navigation-header';
import { CustomHeaderComponentType } from './custom-header-component-type';

const DNSRecordsHeader: CustomHeaderComponentType = ( {
	selectedDomainName,
	selectedSiteSlug,
} ) => (
	<NavigationHeader
		className="navigation-header__breadcrumb"
		navigationItems={ [
			{
				label: selectedDomainName,
				href: `/domains/manage/all/overview/${ selectedDomainName }/${ selectedSiteSlug }`,
			},
			{
				label: translate( 'DNS records' ),
			},
		] }
		title={ translate( 'DNS records' ) }
		subtitle={ translate( 'DNS records change how your domain works. {a}Learn more{/a}', {
			components: {
				a: (
					<ExternalLink
						href={ localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' ) }
					/>
				),
			},
		} ) }
	/>
);

// Override the title and subtitle for the DNS records page
const dnsRecordsTitle = translate( 'DNS records' );
const dnsRecordsSubtitle = translate(
	'DNS records change how your domain works. {{a}}Learn more{{/a}}.',
	{
		components: {
			a: (
				<ExternalLink href={ localizeUrl( 'https://wordpress.com/support/domains/custom-dns/' ) } />
			),
		},
	}
);

export default DNSRecordsHeader;

export { dnsRecordsTitle, dnsRecordsSubtitle };
