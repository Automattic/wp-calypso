import React, { useEffect, useState } from 'react';
import PlaygroundShell from './playground/PlaygroundShell';
import { DEMOS } from './playground/demos';

// The sidebar demo mimics the wp-admin editor sidebar, which is dark.
const themeForDemo = ( demoId: string ): 'light' | 'dark' =>
	demoId === 'sidebar' ? 'dark' : 'light';

const App: React.FC = () => {
	const [ currentDemoId, setCurrentDemoId ] = useState< string >( () => {
		const saved = localStorage.getItem( 'selectedDemo' );
		return DEMOS.some( ( demo ) => demo.id === saved )
			? ( saved as string )
			: DEMOS[ 0 ].id;
	} );

	const [ currentTheme, setCurrentTheme ] = useState< 'light' | 'dark' >(
		() => themeForDemo( currentDemoId )
	);

	useEffect( () => {
		localStorage.setItem( 'selectedDemo', currentDemoId );
	}, [ currentDemoId ] );

	// Switching demos resets to that demo's preferred theme; the toolbar
	// toggle still overrides it for the current view.
	useEffect( () => {
		setCurrentTheme( themeForDemo( currentDemoId ) );
	}, [ currentDemoId ] );

	const currentDemo =
		DEMOS.find( ( demo ) => demo.id === currentDemoId ) ?? DEMOS[ 0 ];
	const DemoComponent = currentDemo.component;

	return (
		<PlaygroundShell
			demos={ DEMOS }
			currentDemoId={ currentDemo.id }
			onSelectDemo={ setCurrentDemoId }
			currentTheme={ currentTheme }
			onThemeChange={ setCurrentTheme }
		>
			<DemoComponent
				key={ currentDemo.id }
				currentTheme={ currentTheme }
				{ ...currentDemo.props }
			/>
		</PlaygroundShell>
	);
};

export default App;
