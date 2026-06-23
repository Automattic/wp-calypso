// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MotionValue } from 'framer-motion';
import type { ChatState } from '../../types';
import {
	type AgentUIContextValue,
	AgentUIProvider,
} from '../../context/AgentUIContext';

// Capture every animate() call so we can assert what the minimize effect drives
// the `y` motion value toward. Framer's spring physics run on rAF and cannot be
// settled deterministically in jsdom, so we assert on the animate target rather
// than the resting value. Everything else (useMotionValue, motion components)
// stays real so the component renders and the effect runs against live values.
// animate() returns playback controls; the effect's cleanup calls .stop().
const { animateMock } = vi.hoisted( () => ( {
	animateMock: vi.fn( () => ( { stop: () => {} } ) ),
} ) );
vi.mock( 'framer-motion', async () => {
	const actual =
		await vi.importActual< typeof import('framer-motion') >(
			'framer-motion'
		);
	return { ...actual, animate: animateMock };
} );

import { Chat } from './Chat';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

const SEED_Y = -100; // Panel dragged upward; within the clamp for jsdom's 768px height.

// Chat is always rendered inside an AgentUIContainer-provided context; its child
// views ( e.g. Suggestions ) call useAgentUIContext, so the standalone test must
// supply a provider. The minimize-pin effect under test is independent of these
// values, so a minimal stub is sufficient.
const contextValue = {
	variant: 'floating',
} as unknown as AgentUIContextValue;

function Container( { state }: { state: ChatState } ) {
	return (
		<AgentUIProvider value={ contextValue }>
			<Chat
				messages={ [] }
				isProcessing={ false }
				onSubmit={ () => {} }
				variant="floating"
				floatingChatState={ state }
				freeDrag
				initialFreeDragPosition={ { x: 0, y: SEED_Y } }
			/>
		</AgentUIProvider>
	);
}

// Pull the `y` motion value and target out of the most recent animate() call.
function lastAnimate(): { value: MotionValue< number >; target: number } {
	const call = animateMock.mock.calls.at( -1 ) as unknown as [
		MotionValue< number >,
		number,
	];
	return { value: call[ 0 ], target: call[ 1 ] };
}

describe( 'Chat free-drag minimize docking', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		animateMock.mockClear();
	} );

	const renderState = async ( state: ChatState ) => {
		await act( async () => {
			root.render( <Container state={ state } /> );
		} );
	};

	it( 'animates the y offset to 0 on compact → minimized', async () => {
		await renderState( 'compact' );
		animateMock.mockClear();

		await renderState( 'minimized' );

		// bottom: 0 docks the panel, so the correct drag offset is exactly 0.
		expect( lastAnimate().target ).toBe( 0 );
	} );

	it( 'animates the y offset to 0 on expanded → minimized', async () => {
		await renderState( 'expanded' );
		animateMock.mockClear();

		await renderState( 'minimized' );

		expect( lastAnimate().target ).toBe( 0 );
	} );

	it( 'restores the stashed dragged offset on un-minimize', async () => {
		await renderState( 'compact' );
		await renderState( 'minimized' );

		// On minimize the effect stashes y.get() ( the seeded value ) and pins to 0.
		const minimized = lastAnimate();
		expect( minimized.target ).toBe( 0 );
		const yValue = minimized.value;

		animateMock.mockClear();
		await renderState( 'compact' );

		// Un-minimize animates the SAME motion value back to the stashed offset.
		const restored = lastAnimate();
		expect( restored.value ).toBe( yValue );
		expect( restored.target ).toBe( SEED_Y );
	} );
} );
