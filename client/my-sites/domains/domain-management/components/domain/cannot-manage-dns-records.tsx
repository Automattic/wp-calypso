import InfoNotice from './info-notice';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const CannotManageDnsRecords = ( {
	redesigned,
	domain,
}: {
	redesigned: boolean;
	domain: ResponseDomain;
} ) => {
	return (
		<InfoNotice redesigned={ redesigned } text={ domain.cannotManageDnsRecordsReason as string } />
	);
};

export default CannotManageDnsRecords;
