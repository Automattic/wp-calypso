import { type ReactNode, useMemo } from 'react';
import { DomainSuggestionBadge } from '../ui';
import { usePolicyNotices } from './use-policy-notices';

export const usePolicyBadges = ( domainName: string ) => {
	const policyNotices = usePolicyNotices( domainName );

	const badges = useMemo( () => {
		const computedBadges: ReactNode[] = [];

		policyNotices.forEach( ( { type, label, message } ) => {
			computedBadges.push(
				<DomainSuggestionBadge key={ type } popover={ message }>
					{ label }
				</DomainSuggestionBadge>
			);
		} );

		return computedBadges;
	}, [ policyNotices ] );

	return badges;
};
