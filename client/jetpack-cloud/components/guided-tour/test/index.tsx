/**
 * @jest-environment jsdom
 */
import page from '@automattic/calypso-router';
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StrictMode, type ComponentProps } from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { savePreference } from 'calypso/state/preferences/actions';
import GuidedTour from '..';

jest.mock( '@automattic/calypso-router', () => ( { redirect: jest.fn() } ) );
jest.mock( '@automattic/components', () => ( {
	Button: jest.requireActual( '@automattic/components/src/button' ).Button,
	Popover: jest.requireActual( '@automattic/components/src/popover' ).default,
} ) );
jest.mock( 'calypso/state', () => {
	const { useDispatch, useSelector } = jest.requireActual( 'react-redux' );
	return { useDispatch, useSelector };
} );
jest.mock( 'calypso/state/preferences/init', () => ( {} ) );
jest.mock( 'calypso/state/analytics/actions', () =>
	jest.requireActual( 'calypso/state/analytics/actions/record' )
);
jest.mock( 'calypso/state/preferences/actions', () => ( {
	savePreference: jest.fn( ( key: string, value: unknown ) => ( {
		type: 'SAVE_PREFERENCE',
		key,
		value,
	} ) ),
} ) );

const preferenceName = 'test-guided-tour';
const startEvent = 'calypso_jetpack_cloud_start_tour';
const stepEvent = 'calypso_jetpack_cloud_tour_step_view';
const endEvent = 'calypso_jetpack_cloud_end_tour';
const tours = [ 1, 2, 3 ].map( ( step ) => ( {
	target: `#tour-target-${ step }`,
	title: `Tour step ${ step }`,
	description: `Description for step ${ step }`,
} ) );

type Preference = { dismiss?: boolean; savedValue?: string };
type TestState = {
	preferences: {
		lastFetchedTimestamp: number | null;
		localValues: Record< string, Preference >;
		remoteValues: Record< string, Preference >;
	};
};

function renderTour(
	props: Partial< ComponentProps< typeof GuidedTour > > = {},
	preference: Preference = {},
	lastFetchedTimestamp: number | null = 1,
	strict = false
) {
	let state: TestState = {
		preferences: {
			lastFetchedTimestamp,
			localValues: { [ preferenceName ]: preference },
			remoteValues: {},
		},
	};
	const store = configureStore< TestState >()( () => state );
	const element = ( extraProps = {} ) => {
		const tour = (
			<Provider store={ store }>
				<GuidedTour
					tours={ tours }
					preferenceName={ preferenceName }
					{ ...props }
					{ ...extraProps }
				/>
			</Provider>
		);
		return strict ? <StrictMode>{ tour }</StrictMode> : tour;
	};
	const view = render( element() );
	return {
		...view,
		tracks: () => store.getActions().filter( ( action ) => action.meta?.analytics ),
		rerenderTour: ( extraProps: Partial< ComponentProps< typeof GuidedTour > > ) =>
			view.rerender( element( extraProps ) ),
		setPreferences: ( preferences: Partial< TestState[ 'preferences' ] > ) => {
			state = { preferences: { ...state.preferences, ...preferences } };
			act( () => {
				store.dispatch( { type: 'TEST_PREFERENCES_UPDATED' } );
			} );
		},
	};
}

describe( 'GuidedTour analytics', () => {
	let targets: HTMLDivElement;
	let user: ReturnType< typeof userEvent.setup >;

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		user = userEvent.setup( { advanceTimers: jest.advanceTimersByTime } );
		targets = document.createElement( 'div' );
		targets.innerHTML = [ 1, 2, 3 ]
			.map( ( step ) => `<button id="tour-target-${ step }">Target ${ step }</button>` )
			.join( '' );
		document.body.appendChild( targets );
	} );

	afterEach( () => {
		cleanup();
		targets.remove();
		jest.clearAllTimers();
		jest.useRealTimers();
	} );

	it.each( [ 'buttons', 'targets' ] )(
		'records one start when advancing via %s',
		async ( navigation ) => {
			const steps = tours.map( ( tour, index ) =>
				navigation === 'targets' && index < 2
					? { ...tour, nextStepOnTargetClick: tour.target }
					: tour
			);
			const { tracks } = renderTour( { tours: steps } );
			for ( const step of [ 1, 2 ] ) {
				await user.click(
					screen.getByRole( 'button', {
						name: navigation === 'targets' ? `Target ${ step }` : 'Next',
					} )
				);
			}
			expect( screen.getByRole( 'heading', { name: 'Tour step 3' } ) ).toBeVisible();
			expect( tracks() ).toEqual( [
				recordTracksEvent( startEvent, { tour: preferenceName } ),
				recordTracksEvent( stepEvent, { tour: preferenceName, step: 2 } ),
				recordTracksEvent( stepEvent, { tour: preferenceName, step: 3 } ),
			] );
		}
	);

	it( 'records a step change when both steps use the same target', async () => {
		const { tracks } = renderTour( {
			tours: [ tours[ 0 ], { ...tours[ 1 ], target: tours[ 0 ].target } ],
		} );
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		expect( tracks() ).toEqual( [
			recordTracksEvent( startEvent, { tour: preferenceName } ),
			recordTracksEvent( stepEvent, { tour: preferenceName, step: 2 } ),
		] );
	} );

	it( 'does not duplicate events on unrelated rerenders or preference refreshes', () => {
		const { tracks, rerenderTour, setPreferences } = renderTour();
		rerenderTour( { className: 'updated-class' } );
		setPreferences( { lastFetchedTimestamp: 2 } );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
	} );

	it( 'records the start once under StrictMode', () => {
		const { tracks } = renderTour( {}, {}, 1, true );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
	} );

	it( 'waits for preferences before starting', () => {
		const { tracks, setPreferences } = renderTour( {}, {}, null );
		expect( tracks() ).toEqual( [] );
		setPreferences( { lastFetchedTimestamp: 1 } );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
	} );

	it( 'waits for the initial target before starting', () => {
		const target = screen.getByRole( 'button', { name: 'Target 1' } );
		target.remove();
		const { tracks } = renderTour();
		expect( tracks() ).toEqual( [] );
		targets.appendChild( target );
		act( () => jest.advanceTimersByTime( 16 ) );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
	} );

	it( 'waits for the next target instead of tracking the previous one', async () => {
		const target = screen.getByRole( 'button', { name: 'Target 2' } );
		target.remove();
		const { tracks } = renderTour();
		await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
		targets.appendChild( target );
		act( () => jest.advanceTimersByTime( 16 ) );
		expect( tracks() ).toEqual( [
			recordTracksEvent( startEvent, { tour: preferenceName } ),
			recordTracksEvent( stepEvent, { tour: preferenceName, step: 2 } ),
		] );
	} );

	it( 'does not start a dismissed tour and starts again when it is reopened', () => {
		const { tracks, setPreferences } = renderTour( {}, { dismiss: true } );
		expect( screen.queryByRole( 'heading', { name: 'Tour step 1' } ) ).toBeNull();
		expect( tracks() ).toEqual( [] );
		setPreferences( { localValues: { [ preferenceName ]: { dismiss: false } } } );
		expect( tracks() ).toEqual( [ recordTracksEvent( startEvent, { tour: preferenceName } ) ] );
		setPreferences( { localValues: { [ preferenceName ]: { dismiss: true } } } );
		setPreferences( { localValues: { [ preferenceName ]: { dismiss: false } } } );
		expect( tracks() ).toEqual( [
			recordTracksEvent( startEvent, { tour: preferenceName } ),
			recordTracksEvent( startEvent, { tour: preferenceName } ),
		] );
	} );

	it( 'starts a different tour when the preference name changes', () => {
		const { tracks, rerenderTour } = renderTour();
		rerenderTour( { preferenceName: 'another-tour' } );
		expect( tracks() ).toEqual( [
			recordTracksEvent( startEvent, { tour: preferenceName } ),
			recordTracksEvent( startEvent, { tour: 'another-tour' } ),
		] );
	} );

	it.each( [ 'Skip', 'Done' ] )(
		'preserves dismissal, saved values, and redirects on %s',
		async ( button ) => {
			const { tracks } = renderTour(
				{ redirectAfterTourEnds: '/overview' },
				{ savedValue: 'keep' }
			);
			if ( button === 'Done' ) {
				await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
				await user.click( screen.getByRole( 'button', { name: 'Next' } ) );
			}
			await user.click( screen.getByRole( 'button', { name: button } ) );
			expect( savePreference ).toHaveBeenCalledWith( preferenceName, {
				savedValue: 'keep',
				dismiss: true,
			} );
			expect( page.redirect ).toHaveBeenCalledWith( '/overview' );
			expect(
				tracks().filter( ( action ) => action.meta.analytics[ 0 ].payload.name === endEvent )
			).toEqual( [ recordTracksEvent( endEvent, { tour: preferenceName } ) ] );
		}
	);

	it( 'starts a newly mounted single-step tour and completes with Got it', async () => {
		const first = renderTour( { tours: tours.slice( 0, 1 ) } );
		first.unmount();
		const { tracks } = renderTour( { tours: tours.slice( 0, 1 ) } );
		await user.click( screen.getByRole( 'button', { name: 'Got it' } ) );
		expect( tracks() ).toEqual( [
			recordTracksEvent( startEvent, { tour: preferenceName } ),
			recordTracksEvent( endEvent, { tour: preferenceName } ),
		] );
	} );
} );
