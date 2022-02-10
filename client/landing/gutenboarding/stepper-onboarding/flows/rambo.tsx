import { useState } from '@wordpress/element';
import RamboFirstBlood from '../steps/rambo-first-blood';
import RamboFirstBloodII from '../steps/rambo-first-blood-ii';
import RamboIII from '../steps/rambo-iii';
import type { Flow, FlowStepIndex } from '../types';

// 1. Define paths
const flowPaths = [ '/rambo/first', '/rambo/second', '/rambo/third' ] as const;

// 2. Map steps to paths
const ramboFlowIndex: FlowStepIndex< typeof flowPaths[ number ] > = new Map( [
	[
		RamboFirstBlood.slug,
		{
			path: flowPaths[ 0 ],
			...RamboFirstBlood,
		},
	],
	[
		RamboFirstBloodII.slug,
		{
			path: flowPaths[ 1 ],
			...RamboFirstBloodII,
		},
	],
	[
		RamboIII.slug,
		{
			path: flowPaths[ 2 ],
			...RamboIII,
		},
	],
] );

// 3. Flow config
const ramboLinearFlow: Flow< typeof flowPaths[ number ] > = {
	path: '/rambo',
	steps: ramboFlowIndex,
	Render: ( { Next, step, index } ) => {
		const [ next, setNext ] = useState< string | null >( null );

		const handleNext = ( slug?: string ) => {
			slug && setNext( slug );
		};

		if ( next ) {
			const path = index.get( next )?.path;
			if ( path ) {
				return Next( { path } );
			}
		}

		const color = '#a4a4ad';

		return (
			<section
				style={ {
					border: `1px solid ${ color }`,
					borderRadius: '5px',
					padding: '20px',
					fontFamily: 'Arial, Helvetica, sans-serif',
				} }
			>
				<h4 style={ { color } }>Flow Step Wrapper</h4>
				<section
					style={ {
						border: `1px solid ${ color }`,
						borderRadius: '5px',
						padding: '20px',
						margin: '20px',
					} }
				>
					<h4 style={ { color } }>Step</h4>
					<step.Render onNext={ handleNext } />
				</section>
			</section>
		);
	},
};

export default ramboLinearFlow;
