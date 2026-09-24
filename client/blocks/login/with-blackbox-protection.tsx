import { useBlackboxProtection } from 'calypso/blocks/login/use-blackbox-protection';
import type { BlackboxProtection } from 'calypso/blocks/login/use-blackbox-protection';
import type { ComponentType } from 'react';

interface WithBlackboxProtectionOptions {
	/** Feature flag gating Blackbox for this surface. */
	feature: string;
}

interface WithBlackboxProtectionProps {
	/** Suspend Blackbox while the host form is mounted but not the active surface. */
	blackboxSuspended?: boolean;
}

/**
 * HOC that injects `useBlackboxProtection()` as a `blackbox` prop, for class
 * components that can't call the hook directly.
 */
export function withBlackboxProtection< P extends object >(
	WrappedComponent: ComponentType< P & { blackbox: BlackboxProtection } >,
	options: WithBlackboxProtectionOptions
): ComponentType< P & WithBlackboxProtectionProps > {
	return function WithBlackboxProtection( {
		blackboxSuspended,
		...props
	}: P & WithBlackboxProtectionProps ) {
		const blackbox = useBlackboxProtection( { ...options, suspended: blackboxSuspended } );
		return <WrappedComponent { ...( props as P ) } blackbox={ blackbox } />;
	};
}
