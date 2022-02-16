import { useState } from '@wordpress/element';
import RamboFirstBlood from '../__unused__steps/rambo-first-blood';
import RamboFirstBloodII from '../__unused__steps/rambo-first-blood-ii';
import RamboIII from '../__unused__steps/rambo-iii';
import type { Flow, FlowStepIndex } from '../types';

// 1. Define paths
const flowPaths = [ '/rambo-linear/first', '/rambo-linear/second', '/rambo-linear/third' ] as const;

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
	path: '/rambo-linear',
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

		/****************************************************
		 * Linear Flow. Flow takes control of navigation.
		 * Following parts would live in hooks/store for flows,
		 * not here. Also reusable in ../index.tsx
		 ****************************************************/

		const getFlowIndex = (/** flow name */) => index;

		const getIndexSteps = () => [ ...getFlowIndex().values() ];

		const getIndexSlugs = () => [ ...getFlowIndex().keys() ];

		const getStepIndexInFlow = ( slug: string ) => {
			return getIndexSlugs().indexOf( slug );
		};

		const getPreviousStepInFlow = ( slug: string ) => {
			const index = getStepIndexInFlow( slug ) - 1;

			if ( index >= 0 ) {
				return getIndexSteps()[ index ];
			}
		};

		const getNextStepInFlow = ( slug: string ) => {
			const index = getStepIndexInFlow( slug ) + 1;

			if ( index <= getIndexSteps().length ) {
				return getIndexSteps()[ index ];
			}
		};

		const isLastStep = ( slug: string ) => {
			return getIndexSteps()[ getIndexSteps().length - 1 ].slug === slug;
		};

		const isFirstStep = ( slug: string ) => {
			return getIndexSteps()[ 0 ].slug === slug;
		};

		/****************************************************/

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
				<nav>
					<button
						onClick={ () => handleNext( getPreviousStepInFlow( step.slug )?.slug ) }
						disabled={ isFirstStep( step.slug ) }
					>
						Previous
					</button>
					<button
						onClick={ () => handleNext( getNextStepInFlow( step.slug )?.slug ) }
						disabled={ isLastStep( step.slug ) }
					>
						Next
					</button>
				</nav>
				<section
					style={ {
						border: `1px solid ${ color }`,
						borderRadius: '5px',
						padding: '20px',
						margin: '20px',
					} }
				>
					<h4 style={ { color } }>Step</h4>
					<step.Render onNext={ () => handleNext( getNextStepInFlow( step.slug )?.slug ) } />
				</section>
			</section>
		);
	},
};

export default ramboLinearFlow;
