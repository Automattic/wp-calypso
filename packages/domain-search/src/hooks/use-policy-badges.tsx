import { useMemo } from 'react';
import { PolicyNoticeBadge } from '../components/policy-notice-badge';
import { useSuggestion } from './use-suggestion';

export const usePolicyBadges = ( domainName: string ) => {
	const suggestion = useSuggestion( domainName );

	return useMemo(
		() =>
			( suggestion.policy_notices || [] ).map( ( notice ) => (
				<PolicyNoticeBadge key={ notice.type } notice={ notice } />
			) ),
		[ suggestion.policy_notices ]
	);
};
