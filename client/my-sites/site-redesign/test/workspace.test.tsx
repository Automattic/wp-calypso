/** @jest-environment jsdom */
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SiteRedesign, {
	getGenerationStageIndex,
	hasPendingBrief,
	reconcileComparison,
	RedesignWorkspace,
} from '../workspace';
import type { Redesign } from '../api';

let mockIsMobile = false;
const mockApply = jest.fn();
const mockGenerate = jest.fn();
const mockRollback = jest.fn();
const mockRestart = jest.fn( () => Promise.resolve() );
const mockRun = {
	id: 'rd_1',
	site_id: 1,
	status: 'preview_ready',
	brief: { goal: 'Read articles', style: 'Blue' },
	eligibility: { can_preview: true, can_apply: false },
	generation: { id: 'gen_1' },
	content: {
		pages: 3,
		posts: 20,
		media: 7,
		truncated: true,
		unsupported: [ { code: 'plugin', message: 'A plugin block could not be previewed.' } ],
	},
	preview: {
		routes: [
			{ path: '/', title: 'Home' },
			{ path: '/about/', title: 'About' },
		],
	},
	applied: null,
} as Redesign;
let mockState: Record< string, unknown >;
jest.mock( '@wordpress/compose', () => ( {
	...jest.requireActual( '@wordpress/compose' ),
	useMediaQuery: () => mockIsMobile,
} ) );
jest.mock( '../use-redesign', () => ( {
	...jest.requireActual( '../use-redesign' ),
	useRedesign: () => mockState,
} ) );
jest.mock( '../use-redesign-agent', () => ( {
	...jest.requireActual( '../use-redesign-agent' ),
	useRedesignAgent: () => ( { ready: true, connected: true, agentUnavailable: false } ),
} ) );
let mockRouteAccess: Record< string, unknown > = { state: 'loading' };
jest.mock( '../eligibility', () => ( {
	useRedesignAccess: () => ( { site: null } ),
	useRedesignRouteAccess: () => mockRouteAccess,
} ) );
const mockRedirect = jest.fn();
jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: ( to: string ) => mockRedirect( to ) },
} ) );
const mockSite = { ID: 1, URL: 'https://example.wordpress.com', slug: 'example.wordpress.com' };
jest.mock( 'react-redux', () => ( {
	...jest.requireActual( 'react-redux' ),
	useSelector: ( selector: ( state: unknown ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( { getSelectedSite: () => mockSite } ) );
jest.mock( 'calypso/state/sites/selectors', () => ( {
	getSiteOption: ( _state: unknown, _siteId: number, option: string ) =>
		option === 'theme_slug' ? 'pub/twentytwentyfive' : undefined,
} ) );
jest.mock( 'calypso/layout/agents-manager-loader', () => ( {
	__esModule: true,
	default: () => <span>Existing WordPress Agent</span>,
} ) );
beforeEach( () => {
	jest.clearAllMocks();
	mockIsMobile = false;
	mockState = {
		run: mockRun,
		brief: mockRun.brief,
		error: null,
		busy: false,
		path: '/',
		setPath: jest.fn(),
		preview: { html: '<p>My existing words verbatim</p>' },
		previewError: false,
		load: jest.fn(),
		generate: mockGenerate,
		apply: mockApply,
		rollback: mockRollback,
		restart: mockRestart,
		succession: null,
	};
} );
const Workspace = () => (
	<RedesignWorkspace
		siteId={ 1 }
		siteUrl="https://example.wordpress.com"
		siteSlug="example.wordpress.com"
		stylesheet="pub/twentytwentyfive"
	/>
);
const renderWorkspace = () => render( <Workspace /> );

test( 'renders sandboxed new preview; apply is an explicit click', async () => {
	const user = userEvent.setup();
	renderWorkspace();
	expect( screen.queryByTitle( 'Original site' ) ).toBeNull();
	expect( mockApply ).not.toHaveBeenCalled();
	const frame = screen.getByTitle( 'New design preview' );
	expect( frame ).toHaveAttribute( 'sandbox', 'allow-scripts' );
	expect( frame ).toHaveAttribute( 'srcdoc', '<p>My existing words verbatim</p>' );
	expect( screen.queryByText( /Upgrade your plan/ ) ).toBeNull();
	await user.click( screen.getByRole( 'button', { name: 'Use this design' } ) );
	expect( mockApply ).toHaveBeenCalledTimes( 1 );
} );

test( 'removes the inactive mobile panel from keyboard navigation and accessibility', async () => {
	mockIsMobile = true;
	const user = userEvent.setup();
	renderWorkspace();
	expect(
		screen.getByRole( 'region', { name: 'WordPress Agent design interview' } )
	).toBeVisible();
	expect( screen.queryByRole( 'region', { name: 'Site preview' } ) ).toBeNull();
	await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
	expect( screen.queryByRole( 'region', { name: 'WordPress Agent design interview' } ) ).toBeNull();
	expect( screen.getByRole( 'region', { name: 'Site preview' } ) ).toBeVisible();
} );

test( 'shows sampling, actual counts, and unsupported content without losing live content', () => {
	renderWorkspace();
	expect(
		screen.getByText( 'Preview content: 3 pages, 20 posts, and 7 media items.' )
	).toBeVisible();
	expect(
		screen.getByText( 'This preview uses a sample of your posts. All posts remain on your site.' )
	).toBeVisible();
	expect( screen.getByText( 'A plugin block could not be previewed.' ) ).toBeVisible();
} );

test( 'offers an optional Generate design for a durable draft, never a manual form', async () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			status: 'interview',
			brief_draft: mockRun.brief,
			brief_revision: 2,
			generation: null,
		},
		preview: null,
	};
	renderWorkspace();
	expect( screen.queryByTitle( 'Original site' ) ).toBeNull();
	expect( screen.queryByRole( 'textbox' ) ).toBeNull();
	expect( screen.queryByText( 'Enter design preferences yourself' ) ).toBeNull();
	expect( screen.getByText( /Approve this brief in the chat/ ) ).toBeVisible();
	expect( mockGenerate ).not.toHaveBeenCalled();
	await userEvent.setup().click( screen.getByRole( 'button', { name: 'Generate design' } ) );
	expect( mockGenerate ).toHaveBeenCalledTimes( 1 );
	expect( mockApply ).not.toHaveBeenCalled();
} );

test( 'keeps the original comparison hidden before a generated preview exists', () => {
	mockState = {
		...mockState,
		run: { ...mockRun, status: 'interview', brief: null, brief_draft: null, generation: null },
		brief: null,
		preview: null,
	};
	renderWorkspace();
	expect( screen.getByRole( 'heading', { name: 'Design your own theme' } ) ).toBeVisible();
	expect( screen.queryByRole( 'radio', { name: 'Original' } ) ).toBeNull();
	expect( screen.queryByRole( 'radio', { name: 'Design brief' } ) ).toBeNull();
	expect( screen.queryByTitle( 'Original site' ) ).toBeNull();
} );

test( 'an old confirmed brief requires the agent to prepare a durable draft', async () => {
	const user = userEvent.setup();
	renderWorkspace();
	await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	expect( screen.getByText( /brief behind this design/ ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: /generate/i } ) ).toBeNull();
} );

test( 'offers rollback only after a supported apply', async () => {
	mockState = {
		...mockState,
		run: { ...mockRun, status: 'applied', applied: { can_rollback: true } },
	};
	const user = userEvent.setup();
	renderWorkspace();
	await user.click( screen.getByRole( 'button', { name: 'Undo design' } ) );
	expect( mockRollback ).toHaveBeenCalledTimes( 1 );
} );

test( 'requires an explicit source-change confirmation after an asynchronous apply failure', async () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			apply: {
				status: 'failed',
				error: { code: 'site_redesign_source_changed', requires: 'allow_source_changes' },
			},
		},
	};
	const user = userEvent.setup();
	renderWorkspace();
	expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeDisabled();
	expect( mockApply ).not.toHaveBeenCalled();
	await user.click( screen.getByRole( 'button', { name: 'Use this design anyway' } ) );
	expect( mockApply ).toHaveBeenCalledWith( true );
} );

test( 'preserves query-based original routes and suppresses native admin chrome', async () => {
	const user = userEvent.setup();
	mockState = { ...mockState, path: '/?page_id=13' };
	renderWorkspace();
	await user.click( screen.getByRole( 'radio', { name: 'Original' } ) );
	expect( screen.getByTitle( 'Original site' ) ).toHaveAttribute(
		'src',
		'https://example.wordpress.com/?page_id=13&theme=pub%2Ftwentytwentyfive&hide_banners=true&iframe=true'
	);
} );

test( 'opens the revised server brief while retaining access to the previous candidate', () => {
	const draft = { goal: 'Find articles', style: 'Warm', audience: 'Readers' };
	mockState = {
		...mockState,
		run: { ...mockRun, brief_draft: draft, brief_revision: 2 },
		brief: draft,
	};
	renderWorkspace();
	expect( screen.getByText( draft.goal ) ).toBeVisible();
	expect( screen.getByText( /Readers/ ) ).toBeVisible();
	expect( screen.getByText( /Approve this brief in the chat/ ) ).toBeVisible();
	expect( screen.queryByTitle( 'New design preview' ) ).toBeNull();
} );

test.each( [ 'applying', 'applied' ] )( 'never offers another apply during %s', ( status ) => {
	mockState = { ...mockState, run: { ...mockRun, status } };
	renderWorkspace();
	expect( screen.queryByRole( 'button', { name: 'Use this design' } ) ).toBeNull();
	expect( screen.getByTitle( 'New design preview' ) ).toBeVisible();
	expect( screen.queryByText( 'Using your new design' ) !== null ).toBe( status === 'applying' );
} );

test.each( [
	[ null, 0 ],
	[ 'snapshot', 1 ],
	[ 'dsl-plan', 1 ],
	[ 'theme-author', 1 ],
	[ 'apply-identity', 2 ],
	[ 'dsl-variations', 3 ],
	[ 'dsl-validate', 3 ],
	[ 'an-unknown-step', null ],
] )( 'after step %p the generation is on stage %p', ( step, stage ) => {
	expect( getGenerationStageIndex( step ) ).toBe( stage );
} );

test( 'shows generation stages from the reported progress', () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			status: 'generating',
			generation: {
				id: 'gen_1',
				status: 'running',
				progress: { step: 'theme-author', completed: 5, total: 19 },
				error: null,
			},
		},
	};
	renderWorkspace();
	expect( screen.getByRole( 'heading', { name: 'Generating your design' } ) ).toBeVisible();
	expect( screen.getByText( 'Planning the look' ).closest( 'li' ) ).toHaveAttribute(
		'aria-current',
		'step'
	);
	expect( screen.getByText( 'Reading your pages and menus' ).closest( 'li' ) ).toHaveTextContent(
		'Done'
	);
	expect( screen.getByText( 'Building your preview' ).closest( 'li' ) ).not.toHaveAttribute(
		'aria-current'
	);
	expect( screen.queryByText( /of 19/ ) ).toBeNull();
	expect( screen.queryByRole( 'region', { name: 'Your design direction' } ) ).toBeNull();
	expect( screen.queryByRole( 'progressbar' ) ).toBeNull();
	expect( screen.queryByRole( 'radio', { name: 'Original' } ) ).toBeNull();
	expect( screen.queryByRole( 'radio', { name: 'Design brief' } ) ).toBeNull();
	expect( screen.getByRole( 'list', { name: 'Design stages' } ).children ).toHaveLength( 4 );
} );

test( 'an undo in progress says it restores the previous design', () => {
	mockState = {
		...mockState,
		run: { ...mockRun, status: 'applying', apply: { status: 'rolling_back', error: null } },
	};
	renderWorkspace();
	expect( screen.getByText( 'Restoring your previous design' ) ).toBeVisible();
	expect( screen.queryByText( 'Using your new design' ) ).toBeNull();
} );

describe( 'reconcileComparison', () => {
	const run = ( over = {} ) => ( {
		runId: 'rd_1',
		generationId: 'gen_1',
		status: 'preview_ready',
		briefRevision: 1,
		...over,
	} );

	test.each( [
		[ 'a new generation starts', run(), run( { generationId: 'gen_2', status: 'generating' } ) ],
		[ 'a generation finishes', run( { status: 'generating' } ), run() ],
		[
			'a new generation finished between two polls',
			run(),
			run( { generationId: 'gen_2', status: 'preview_ready' } ),
		],
	] )( 'releases the brief view when %s', ( _label, previous, current ) => {
		expect( reconcileComparison( 'brief', previous, current, false ) ).toBeNull();
		expect( reconcileComparison( 'original', previous, current, false ) ).toBe( 'original' );
	} );

	test( 'keeps a newer brief open for review instead of jumping to the preview', () => {
		expect(
			reconcileComparison(
				'brief',
				run(),
				run( { generationId: 'gen_2', briefRevision: 2 } ),
				true
			)
		).toBe( 'brief' );
	} );

	test( 'opens a new brief revision on a finished design, unless comparing with the original', () => {
		const next = run( { briefRevision: 2 } );
		expect( reconcileComparison( null, run(), next, true ) ).toBe( 'brief' );
		expect( reconcileComparison( 'new', run(), next, true ) ).toBe( 'brief' );
		expect( reconcileComparison( 'original', run(), next, true ) ).toBe( 'original' );
	} );

	test( 'starts fresh for another run and opens a waiting brief on first load', () => {
		expect( reconcileComparison( 'original', run(), run( { runId: 'rd_2' } ), false ) ).toBeNull();
		expect( reconcileComparison( null, null, run(), true ) ).toBe( 'brief' );
		expect( reconcileComparison( null, null, run(), false ) ).toBeNull();
	} );
} );

test( 'follows an agent-started generation from the brief to its preview', async () => {
	const user = userEvent.setup();
	const confirmed = { ...mockRun, brief_draft: mockRun.brief, brief_revision: 1 };
	mockState = {
		...mockState,
		run: { ...confirmed, generation: { ...mockRun.generation, brief_revision: 1 } },
	};
	const view = renderWorkspace();
	await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	expect( screen.queryByTitle( 'New design preview' ) ).toBeNull();

	mockState = {
		...mockState,
		run: {
			...confirmed,
			status: 'generating',
			generation: {
				id: 'gen_2',
				status: 'running',
				brief_revision: 1,
				started_by: 'agent',
				progress: { step: 'dsl-plan', completed: 4, total: 19 },
				error: null,
			},
		},
	};
	view.rerender( <Workspace /> );
	expect( screen.getByRole( 'heading', { name: 'Generating your design' } ) ).toBeVisible();

	mockState = {
		...mockState,
		run: {
			...confirmed,
			generation: { ...mockRun.generation, id: 'gen_2', brief_revision: 1 },
		},
	};
	view.rerender( <Workspace /> );
	expect( screen.getByTitle( 'New design preview' ) ).toBeVisible();
	expect( mockGenerate ).not.toHaveBeenCalled();
} );

describe( 'hasPendingBrief', () => {
	const brief = { goal: 'Read articles', style: 'Blue' };
	const legacy = {
		...mockRun,
		brief,
		brief_draft: { style: 'Blue', goal: 'Read articles' },
		brief_revision: 3,
		generation: { ...mockRun.generation, id: 'gen_old' },
	} as Redesign;

	test( 'treats a legacy generation without a recorded revision as built from its own brief', () => {
		expect( hasPendingBrief( legacy ) ).toBe( false );
		expect( hasPendingBrief( { ...legacy, brief_draft: { ...brief, style: 'Green' } } ) ).toBe(
			true
		);
	} );

	test( 'compares revisions when the generation records one', () => {
		const recorded = { ...legacy, generation: { ...legacy.generation!, brief_revision: 3 } };
		expect( hasPendingBrief( recorded ) ).toBe( false );
		expect( hasPendingBrief( { ...recorded, brief_revision: 4 } ) ).toBe( true );
	} );

	test( 'a draft before any generation waits for approval', () => {
		expect( hasPendingBrief( { ...legacy, status: 'interview', generation: null } ) ).toBe( true );
		expect( hasPendingBrief( { ...legacy, brief_draft: null } ) ).toBe( false );
	} );
} );

test( 'resumes a legacy finished design on its preview, not its brief', () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			brief: { goal: 'Read articles', style: 'Blue' },
			brief_draft: { style: 'Blue', goal: 'Read articles' },
			brief_revision: 3,
		},
	};
	renderWorkspace();
	expect( screen.getByTitle( 'New design preview' ) ).toBeVisible();
	expect( screen.getByRole( 'radio', { name: 'New design' } ) ).toBeChecked();
	expect( mockGenerate ).not.toHaveBeenCalled();
} );

test( 'starts a new brief as a fresh run without a chat message, generation, or apply', async () => {
	const submitChatMessage = jest.fn( () => Promise.resolve() );
	window.__agentsManagerActions = {
		submitChatMessage,
	} as unknown as typeof window.__agentsManagerActions;
	mockIsMobile = true;
	const confirmed = { goal: 'Read articles', style: 'Blue' };
	mockState = {
		...mockState,
		run: {
			...mockRun,
			brief: confirmed,
			brief_draft: confirmed,
			brief_revision: 2,
			generation: { ...mockRun.generation, brief_revision: 2 },
		},
		brief: confirmed,
	};
	const user = userEvent.setup();
	renderWorkspace();
	await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
	await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	expect( screen.getByText( /brief behind this design/ ) ).toBeVisible();
	expect( screen.queryByRole( 'button', { name: 'Generate design' } ) ).toBeNull();
	await user.click( screen.getByRole( 'button', { name: 'Start a new brief' } ) );
	expect( mockRestart ).toHaveBeenCalledTimes( 1 );
	expect( submitChatMessage ).not.toHaveBeenCalled();
	expect( mockGenerate ).not.toHaveBeenCalled();
	expect( mockApply ).not.toHaveBeenCalled();
	delete window.__agentsManagerActions;
} );

test( 'offers no start while a design is generating', () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			status: 'generating',
			brief_draft: mockRun.brief,
			brief_revision: 2,
			generation: {
				id: 'gen_2',
				status: 'running',
				brief_revision: 2,
				progress: { step: 'dsl-plan', completed: 4, total: 19 },
				error: null,
			},
		},
	};
	renderWorkspace();
	expect( screen.queryByRole( 'button', { name: 'Generate design' } ) ).toBeNull();
	expect( screen.queryByRole( 'button', { name: 'Start a new brief' } ) ).toBeNull();
} );

test.each( [ 'applied', 'rolled_back' ] )(
	'offers a new brief once the run is %s',
	async ( status ) => {
		mockState = { ...mockState, run: { ...mockRun, status, can_restart: true } };
		const user = userEvent.setup();
		renderWorkspace();
		await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
		expect( screen.getByRole( 'button', { name: 'Start a new brief' } ) ).toBeEnabled();
	}
);

test( 'offers no new brief when the server disallows starting over', () => {
	mockState = {
		...mockState,
		run: { ...mockRun, status: 'interview', can_restart: false },
	};
	renderWorkspace();
	expect( screen.queryByRole( 'button', { name: 'Start a new brief' } ) ).toBeNull();
} );

test( 'moves the mobile workspace to the fresh interview when the run is replaced', async () => {
	mockIsMobile = true;
	const user = userEvent.setup();
	const { rerender } = renderWorkspace();
	await user.click( screen.getByRole( 'radio', { name: 'Design' } ) );
	mockState = {
		...mockState,
		run: { ...mockRun, id: 'rd_2', status: 'interview', brief: null, generation: null },
		brief: null,
		preview: null,
		succession: { from: mockRun.id, to: 'rd_2' },
	};
	rerender( <Workspace /> );
	expect(
		screen.getByRole( 'region', { name: 'WordPress Agent design interview' } )
	).toBeVisible();
	expect( screen.queryByTitle( 'New design preview' ) ).toBeNull();
} );

test( 'waits for the agent to finish answering before starting a new brief', async () => {
	const { act } = await import( '@testing-library/react' );
	mockState = {
		...mockState,
		run: {
			...mockRun,
			status: 'interview',
			brief_draft: mockRun.brief,
			brief_revision: 2,
			generation: null,
		},
	};
	renderWorkspace();
	const button = screen.getByRole( 'button', { name: 'Start a new brief' } );
	expect( button ).toBeEnabled();
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-turn-started' ) );
	} );
	expect( button ).toBeDisabled();
	expect( screen.getByRole( 'button', { name: 'Generate design' } ) ).toBeDisabled();
	expect( screen.queryByText( /You can start a new brief when it finishes/ ) ).toBeNull();
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-turn-ended' ) );
	} );
	expect( button ).toBeEnabled();
	expect( screen.getByRole( 'button', { name: 'Generate design' } ) ).toBeEnabled();
} );

test( 'keeps the native secondary button disabled and busy until restart settles', async () => {
	let finishRestart!: () => void;
	mockRestart.mockImplementationOnce(
		() => new Promise< void >( ( resolve ) => ( finishRestart = resolve ) )
	);
	renderWorkspace();
	const user = userEvent.setup();
	await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	const button = screen.getByRole( 'button', { name: 'Start a new brief' } );
	await user.click( button );
	expect( button ).toBeDisabled();
	expect( button ).toHaveClass( 'components-button', 'is-busy' );
	await act( async () => finishRestart() );
	expect( button ).toBeEnabled();
	expect( button ).not.toHaveClass( 'is-busy' );
} );

test( 'keeps Start a new brief disabled when the workspace remounts mid-turn', () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			status: 'interview',
			brief_draft: mockRun.brief,
			brief_revision: 2,
			generation: null,
		},
	};
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-turn-started' ) );
	} );
	const { unmount } = renderWorkspace();
	unmount();
	renderWorkspace();
	expect( screen.getByRole( 'button', { name: 'Start a new brief' } ) ).toBeDisabled();
	act( () => {
		window.dispatchEvent( new Event( 'agents-manager-turn-ended' ) );
	} );
	expect( screen.getByRole( 'button', { name: 'Start a new brief' } ) ).toBeEnabled();
} );

test( 'offers only the existing design back from a paid checkout', async () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			brief_draft: { goal: 'Read articles', style: 'Warm' },
			brief_revision: 3,
			can_restart: true,
		},
	};
	const user = userEvent.setup();
	render(
		<RedesignWorkspace
			siteId={ 1 }
			siteUrl="https://example.wordpress.com"
			siteSlug="example.wordpress.com"
			stylesheet="pub/twentytwentyfive"
			applyOnly
		/>
	);
	expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
	await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	expect( screen.queryByRole( 'button', { name: 'Generate design' } ) ).toBeNull();
	expect( screen.queryByRole( 'button', { name: 'Start a new brief' } ) ).toBeNull();
} );

describe( 'route access', () => {
	test( 'sends paid sites without a valid checkout return back to Themes', () => {
		mockRouteAccess = { state: 'redirect', to: '/themes/example.wordpress.com' };
		render( <SiteRedesign /> );
		expect( mockRedirect ).toHaveBeenCalledWith( '/themes/example.wordpress.com' );
		expect( screen.queryByRole( 'button', { name: 'Use this design' } ) ).toBeNull();
	} );

	test( 'opens a paid checkout return for the existing design only', async () => {
		mockRouteAccess = { state: 'allowed', site: mockSite, applyOnly: true };
		mockState = {
			...mockState,
			run: {
				...mockRun,
				brief_draft: { goal: 'Read articles', style: 'Warm' },
				brief_revision: 3,
				can_restart: true,
			},
		};
		const user = userEvent.setup();
		render( <SiteRedesign /> );
		expect( screen.getByRole( 'button', { name: 'Use this design' } ) ).toBeEnabled();
		await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
		expect( screen.queryByRole( 'button', { name: 'Generate design' } ) ).toBeNull();
		expect( screen.queryByRole( 'button', { name: 'Start a new brief' } ) ).toBeNull();
		expect( screen.getByText( /choose Use this design to make it live/ ) ).toBeVisible();
		expect( screen.queryByText( /start a new brief/i ) ).toBeNull();
		expect( screen.queryByText( /generate it/i ) ).toBeNull();
		expect( mockRedirect ).not.toHaveBeenCalled();
	} );

	test( 'keeps the full redesign on Free', async () => {
		mockRouteAccess = { state: 'allowed', site: mockSite, applyOnly: false };
		mockState = {
			...mockState,
			run: { ...mockRun, brief_draft: { goal: 'Read', style: 'Warm' }, brief_revision: 3 },
		};
		const user = userEvent.setup();
		render( <SiteRedesign /> );
		await user.click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
		expect( screen.getByRole( 'button', { name: 'Generate design' } ) ).toBeVisible();
	} );

	test( 'returns to Themes when the checkout run cannot be used here', () => {
		mockRouteAccess = { state: 'allowed', site: mockSite, applyOnly: true };
		mockState = { ...mockState, closed: true };
		render( <SiteRedesign /> );
		expect( mockRedirect ).toHaveBeenCalledWith( '/themes/example.wordpress.com' );
	} );
} );

test( 'a brief that already produced its preview offers no Generate design button', async () => {
	mockState = {
		...mockState,
		run: {
			...mockRun,
			brief_draft: mockRun.brief,
			brief_revision: 2,
			generation: { id: 'gen_1', status: 'succeeded', brief_revision: 2, error: null },
			can_restart: true,
		},
	};
	renderWorkspace();
	await userEvent.setup().click( screen.getByRole( 'radio', { name: 'Design brief' } ) );
	expect( screen.queryByRole( 'button', { name: 'Generate design' } ) ).toBeNull();
	expect( screen.getByRole( 'button', { name: 'Start a new brief' } ) ).toBeEnabled();
} );
