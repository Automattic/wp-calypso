import { PrimaryDomainLabel } from '@automattic/domains-table';
import { domainInfoContext } from '@automattic/domains-table/src/utils/constants';
import { getDomainTypeText } from '@automattic/domains-table/src/utils/get-domain-type-text';
import { domainManagementLink as getDomainManagementLink } from '@automattic/domains-table/src/utils/paths';
import { Button } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { navigate } from 'calypso/lib/navigate';
import { DomainData } from '../types';

interface Props {
	domain: DomainData;
	isAllSitesView: boolean;
	selectedFeature?: string;
	openDomainPane?: ( domain: DomainData ) => void;
}

const DomainField = ( { domain, isAllSitesView, selectedFeature, openDomainPane }: Props ) => {
	const { __ } = useI18n();

	const domainManagementLink = ! domain.processed.isWPCOMDomain
		? getDomainManagementLink( domain.processed, domain.original.site_slug, true, selectedFeature )
		: '';

	const domainTypeText = getDomainTypeText( domain.processed, __, domainInfoContext.DOMAIN_ROW );
	const showPrimaryDomainLabel = ! isAllSitesView && domain.processed.isPrimary;

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
			openDomainPane( domain );
		} else {
			navigate( domainManagementLink, openInNewTab );
		}
	};

	return (
		<Button className="domains-dataviews__domain-name-button" onClick={ onDomainClick }>
			{ showPrimaryDomainLabel && <PrimaryDomainLabel /> }
			<div className="domains-dataviews__domain-name">{ domain.processed.domain }</div>

			{ domainTypeText && (
				<div className="domains-table-row__domain-type-text">{ domainTypeText }</div>
			) }
		</Button>
	);
};

export { DomainField };
