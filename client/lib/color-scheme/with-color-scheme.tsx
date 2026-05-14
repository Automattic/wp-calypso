import { useEffect } from 'react';
import { ColorSchemeProvider } from './query-provider';
import type { ComponentType, ReactNode } from 'react';

type ColorSchemeProviderComponent = ComponentType< { children: ReactNode } >;

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
	if ( ! enabled ) {
		return children;
	}

	return (
		<Provider>
			{ bodyClass && <BodyClass className={ bodyClass } /> }
			{ children }
		</Provider>
	);
}
