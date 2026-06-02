import React, { useEffect, useState } from 'react';
import EmbeddedDemo from './EmbeddedDemo';
import FloatingDemo from './FloatingDemo';
import FloatingCompactDemo from './FloatingCompactDemo';
import SiteSpecDemo from './SiteSpecDemo';
import SidebarDemo from './SidebarDemo';

const App: React.FC = () => {
	const [ currentDemo, setCurrentDemo ] = useState<
		| 'embedded'
		| 'floating'
		| 'floating-minimized'
		| 'floating-compact'
		| 'site-spec'
		| 'sidebar'
	>( () => {
		// Get saved demo from localStorage or default to 'embedded'
		const saved = localStorage.getItem( 'selectedDemo' );
		if (
			saved === 'floating' ||
			saved === 'floating-minimized' ||
			saved === 'floating-compact' ||
			saved === 'site-spec' ||
			saved === 'sidebar'
		) {
			return saved as
				| 'floating'
				| 'floating-minimized'
				| 'floating-compact'
				| 'site-spec'
				| 'sidebar';
		}
		return 'embedded';
	} );

	const [ currentTheme, setCurrentTheme ] = useState< 'light' | 'dark' >(
		'light'
	);

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
					onClick={ () => setCurrentDemo( 'floating-minimized' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'floating-minimized'
								? '#000'
								: 'white',
						color:
							currentDemo === 'floating-minimized'
								? 'white'
								: '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Minimized
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
				<button
					onClick={ () => setCurrentDemo( 'site-spec' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'site-spec' ? '#000' : 'white',
						color: currentDemo === 'site-spec' ? 'white' : '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Site Spec
				</button>
				<button
					onClick={ () => setCurrentDemo( 'sidebar' ) }
					style={ {
						padding: '8px 10px',
						background:
							currentDemo === 'sidebar' ? '#000' : 'white',
						color: currentDemo === 'sidebar' ? 'white' : '#000',
						cursor: 'pointer',
						fontSize: '12px',
						fontFamily: 'monospace',
						textTransform: 'uppercase',
					} }
				>
					Sidebar
				</button>
				<div style={ { marginLeft: '30px' } }>
					<button
						onClick={ () => setCurrentTheme( 'dark' ) }
						style={ {
							padding: '8px 10px',
							background:
								currentTheme === 'dark' ? '#000' : 'white',
							color: currentTheme === 'dark' ? 'white' : '#000',
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
								currentTheme === 'light' ? '#000' : 'white',
							color: currentTheme === 'light' ? 'white' : '#000',
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
			{ currentDemo === 'embedded' && (
				<EmbeddedDemo currentTheme={ currentTheme } />
			) }
			{ currentDemo === 'floating' && (
				<FloatingDemo currentTheme={ currentTheme } />
			) }
			{ currentDemo === 'floating-minimized' && (
				<FloatingDemo
					currentTheme={ currentTheme }
					floatingChatState="minimized"
					triggerTitle="Ask AI"
				/>
			) }
			{ currentDemo === 'floating-compact' && (
				<FloatingCompactDemo currentTheme={ currentTheme } />
			) }
			{ currentDemo === 'site-spec' && (
				<SiteSpecDemo currentTheme={ currentTheme } />
			) }
			{ currentDemo === 'sidebar' && <SidebarDemo /> }
		</>
	);
};

export default App;
