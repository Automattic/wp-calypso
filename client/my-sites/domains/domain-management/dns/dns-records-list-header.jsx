import './style.scss';
import { localize } from 'i18n-calypso';
import DnsRecordsListItem from 'calypso/my-sites/domains/domain-management/dns/dns-records-list-item';

function DnsRecordsListHeader( { translate } ) {
	return (
		<DnsRecordsListItem
			isHeader={ true }
			type={ translate( 'Type' ) }
			name={ translate( 'Name' ) }
			value={ translate( 'Value' ) }
		/>
	);
}

export default localize( DnsRecordsListHeader );
