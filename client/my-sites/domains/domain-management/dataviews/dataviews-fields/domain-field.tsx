import { PartialDomainData } from '@automattic/data-stores';
import { PrimaryDomainLabel } from '@automattic/domains-table';
import { domainInfoContext } from '@automattic/domains-table/src/utils/constants';
import { getDomainTypeText } from '@automattic/domains-table/src/utils/get-domain-type-text';
import { domainManagementLink as getDomainManagementLink } from '@automattic/domains-table/src/utils/paths';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { navigate } from 'calypso/lib/navigate';
import { useDomainsDataViewsContext } from '../use-context';

interface Props {
	domain: PartialDomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
	openDomainPane?: ( domain: PartialDomainData ) => void;
}

const DomainField = ( {
	domain: partialDomain,
	isAllSitesView,
	selectedFeature,
	openDomainPane,
}: Props ) => {
	const { __ } = useI18n();

	const { getFullDomain, getSiteSlug } = useDomainsDataViewsContext();

	const domain = getFullDomain( partialDomain );
	const siteSlug = getSiteSlug( partialDomain );

	const domainManagementLink = ! partialDomain.wpcom_domain
		? getDomainManagementLink( partialDomain, siteSlug, true, selectedFeature )
		: '';

	const domainTypeText = domain
		? getDomainTypeText( domain, __, domainInfoContext.DOMAIN_ROW )
		: '';
	const showPrimaryDomainLabel = ! isAllSitesView && domain && domain.isPrimary;

	const onDomainClick = ( event: React.MouseEvent ) => {
		event.preventDefault();

		if ( ! domainManagementLink ) {
			return;
		}

		let openInNewTab = false;

		if ( event.ctrlKey || event.metaKey ) {
			openInNewTab = true;
		}

		// Support middle click to open in new tab
		if ( event.button === 1 ) {
			openInNewTab = true;
		}

		if ( openDomainPane ) {
			openDomainPane( partialDomain );
		} else {
			navigate( domainManagementLink, openInNewTab );
		}
	};

	return (
		<Button className="domains-dataviews__domain-name-button" onClick={ onDomainClick }>
			{ showPrimaryDomainLabel && <PrimaryDomainLabel /> }
			<div className="domains-dataviews__domain-name">{ partialDomain.domain }</div>

			{ domainTypeText && (
				<div className="domains-table-row__domain-type-text">{ domainTypeText }</div>
			) }
		</Button>
	);
};

export { DomainField };
