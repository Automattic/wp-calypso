import { useBlackboxProtection } from 'calypso/blocks/login/use-blackbox-protection';
import type { BlackboxProtection } from 'calypso/blocks/login/use-blackbox-protection';
import type { ComponentType } from 'react';

interface WithBlackboxProtectionOptions {
	/** Feature flag gating Blackbox for this surface. */
	feature: string;
}

/**
 * HOC that injects `useBlackboxProtection()` as a `blackbox` prop, for class
 * components that can't call the hook directly.
 */
export function withBlackboxProtection< P extends object >(
	WrappedComponent: ComponentType< P & { blackbox: BlackboxProtection } >,
	options: WithBlackboxProtectionOptions
): ComponentType< P > {
	return function WithBlackboxProtection( props: P ) {
		const blackbox = useBlackboxProtection( options );
		return <WrappedComponent { ...props } blackbox={ blackbox } />;
	};
}
