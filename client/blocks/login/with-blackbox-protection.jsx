import { useBlackboxProtection } from 'calypso/blocks/login/use-blackbox-protection';

/**
 * HOC that injects useBlackboxProtection() as a `blackbox` prop, for class
 * components that can't call the hook directly.
 * @param {import('react').ComponentType} WrappedComponent Component to wrap.
 * @param {Object} options Options forwarded to `useBlackboxProtection` (e.g. `feature`).
 * @returns {import('react').FunctionComponent} Component receiving a `blackbox` prop.
 */
export function withBlackboxProtection( WrappedComponent, options ) {
	return function WithBlackboxProtection( props ) {
		const blackbox = useBlackboxProtection( options );
		return <WrappedComponent { ...props } blackbox={ blackbox } />;
	};
}
