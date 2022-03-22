import InfoNotice from './info-notice';
import type { ResponseDomain } from 'calypso/lib/domains/types';

const CannotUpdateContactInfo = ( {
	redesigned,
	domain,
}: {
	redesigned: boolean;
	domain: ResponseDomain;
} ) => {
	return (
		<InfoNotice redesigned={ redesigned } text={ domain.cannotUpdateContactInfoReason as string } />
	);
};

export default CannotUpdateContactInfo;
