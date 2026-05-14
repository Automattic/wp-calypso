import { useEffect } from 'react';
import { ColorSchemeProvider } from './query-provider';
import type { ComponentType, ReactNode } from 'react';

type ColorSchemeProviderComponent = ComponentType< { children: ReactNode } >;

function BodyClass( { classNames }: { classNames: string[] } ) {
	useEffect( () => {
		if ( typeof document === 'undefined' ) {
			return;
		}

		classNames.forEach( ( className ) => {
			document.body.classList.add( className );
		} );

		return () => {
			classNames.forEach( ( className ) => {
				document.body.classList.remove( className );
			} );
		};
	}, [ classNames ] );

	return null;
}

export function withColorScheme(
	children: ReactNode,
	{
		bodyClass,
		enabled = true,
		Provider = ColorSchemeProvider,
	}: {
		bodyClass?: string | string[];
		enabled?: boolean;
		Provider?: ColorSchemeProviderComponent;
	} = {}
) {
	if ( ! enabled ) {
		return children;
	}

	const bodyClasses = typeof bodyClass === 'string' ? [ bodyClass ] : bodyClass;

	return (
		<Provider>
			{ bodyClasses && <BodyClass classNames={ bodyClasses } /> }
			{ children }
		</Provider>
	);
}
