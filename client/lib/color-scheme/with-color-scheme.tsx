import { useEffect } from 'react';
import { ColorSchemeProvider } from './query-provider';
import type { ComponentType, ReactNode } from 'react';

type ColorSchemeProviderComponent = ComponentType< { children: ReactNode; enabled?: boolean } >;

function BodyClass( { className }: { className: string } ) {
	useEffect( () => {
		if ( typeof document === 'undefined' ) {
			return;
		}

		document.body.classList.add( className );

		return () => {
			document.body.classList.remove( className );
		};
	}, [ className ] );

	return null;
}

export function withColorScheme(
	children: ReactNode,
	{
		bodyClass,
		enabled = true,
		Provider = ColorSchemeProvider,
	}: {
		bodyClass?: string;
		enabled?: boolean;
		Provider?: ColorSchemeProviderComponent;
	} = {}
) {
	// Always render the provider so toggling `enabled` (for example once remote
	// preferences load) doesn't re-parent and remount `children`. The provider
	// gates its document side effects on `enabled`, and the body class is only
	// mounted while enabled.
	return (
		<Provider enabled={ enabled }>
			{ enabled && bodyClass && <BodyClass className={ bodyClass } /> }
			{ children }
		</Provider>
	);
}
