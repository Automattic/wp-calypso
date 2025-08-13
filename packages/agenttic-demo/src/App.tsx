import React, { useEffect, useState } from 'react';
import EmbeddedDemo from './EmbeddedDemo';
import FloatingDemo from './FloatingDemo';

const App: React.FC = () => {
	const [ currentDemo, setCurrentDemo ] = useState< 'embedded' | 'floating' >(
		() => {
			// Get saved demo from localStorage or default to 'embedded'
			const saved = localStorage.getItem( 'selectedDemo' );
			return ( saved === 'floating' ? 'floating' : 'embedded' ) as
				| 'embedded'
				| 'floating';
		}
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
			</div>
			{ currentDemo === 'embedded' ? <EmbeddedDemo /> : <FloatingDemo /> }
		</>
	);
};

export default App;
