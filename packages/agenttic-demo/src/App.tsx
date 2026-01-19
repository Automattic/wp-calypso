import React, { useEffect, useState } from 'react';
import EmbeddedDemo from './EmbeddedDemo';
import FloatingDemo from './FloatingDemo';
import FloatingCompactDemo from './FloatingCompactDemo';

const App: React.FC = () => {
	const [ currentDemo, setCurrentDemo ] = useState<
		'embedded' | 'floating' | 'floating-compact'
	>( () => {
		// Get saved demo from localStorage or default to 'embedded'
		const saved = localStorage.getItem( 'selectedDemo' );
		if ( saved === 'floating' || saved === 'floating-compact' ) {
			return saved as 'floating' | 'floating-compact';
		}
		return 'embedded';
	} );

	const [ currentTheme, setCurrentTheme ] = useState<'light' | 'dark'>( 'light' );

	// Save to localStorage whenever demo changes
	useEffect( () => {
		localStorage.setItem( 'selectedDemo', currentDemo );
	}, [ currentDemo ] );

	return (
		<>
			<div
				style={ {
					position: 'fixed',
					top: '0',
					left: '0',
					display: 'flex',
					zIndex: 1000,
				} }
			>
				<button
					onClick={ () => setCurrentDemo( 'embedded' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'embedded' ? '#000' : 'white',
						color: currentDemo === 'embedded' ? 'white' : '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Embedded
				</button>
				<button
					onClick={ () => setCurrentDemo( 'floating' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'floating' ? '#000' : 'white',
						color: currentDemo === 'floating' ? 'white' : '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Floating
				</button>
				<button
					onClick={ () => setCurrentDemo( 'floating-compact' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'floating-compact'
								? '#000'
								: 'white',
						color:
							currentDemo === 'floating-compact'
								? 'white'
								: '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Compact
				</button>
				<div style={ { marginLeft: '30px' } }>
					<button
						onClick={ () => setCurrentTheme( 'dark' ) }
						style={ {
							padding: '8px 10px',
							background:
								currentTheme === 'dark'
									? '#000'
									: 'white',
							color:
								currentTheme === 'dark'
									? 'white'
									: '#000',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						DARK THEME
					</button>
					<button
						onClick={ () => setCurrentTheme( 'light' ) }
						style={ {
							padding: '8px 10px',
							background:
								currentTheme === 'light'
									? '#000'
									: 'white',
							color:
								currentTheme === 'light'
									? 'white'
									: '#000',
							cursor: 'pointer',
							fontSize: '12px',
							fontFamily: 'monospace',
							textTransform: 'uppercase',
						} }
					>
						LIGHT THEME
					</button>
				</div>
			</div>
			{ currentDemo === 'embedded' && <EmbeddedDemo currentTheme={ currentTheme } /> }
			{ currentDemo === 'floating' && <FloatingDemo currentTheme={ currentTheme }  /> }
			{ currentDemo === 'floating-compact' && <FloatingCompactDemo currentTheme={ currentTheme } /> }
		</>
	);
};

export default App;
