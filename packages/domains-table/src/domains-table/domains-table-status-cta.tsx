import { Button } from '@automattic/components';
import { ResolveDomainStatusReturn } from '../utils/resolve-domain-status';

interface DomainsTableStatusCTAProps {
	callToAction: Exclude< ResolveDomainStatusReturn[ 'callToAction' ], undefined >;
}

export const DomainsTableStatusCTA = ( { callToAction }: DomainsTableStatusCTAProps ) => {
	return (
		<Button compact onClick={ callToAction.onClick } href={ callToAction.href }>
			{ callToAction.label }
		</Button>
	);
};
