/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import ReviewMediation from './review-mediation';

// Mock scrollIntoView for JSDOM compatibility.
Element.prototype.scrollIntoView = jest.fn();

// Mock requestAnimationFrame to run synchronously.
global.requestAnimationFrame = jest.fn( ( cb ) => {
	cb( 0 );
	return 0;
} );

const mockApplyReviewEdit = jest.fn();
const mockFindBlockElement = jest.fn();
const mockFindBlockListLayout = jest.fn();

jest.mock( '../utils/block-actions', () => ( {
	applyReviewEdit: ( ...args: any[] ) => mockApplyReviewEdit( ...args ),
	findBlockElement: ( ...args: any[] ) => mockFindBlockElement( ...args ),
	findBlockListLayout: ( ...args: any[] ) => mockFindBlockListLayout( ...args ),
} ) );

const mockSelectBlock = jest.fn();
let mockBlocks: any[] = [];

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( fn: any ) =>
		fn( ( store: string ) => {
			if ( store === 'core/block-editor' ) {
				return { getBlocks: () => mockBlocks };
			}
			return {};
		} ),
	useDispatch: ( store: string ) => {
		if ( store === 'core/block-editor' ) {
			return { selectBlock: mockSelectBlock };
		}
		return {};
	},
} ) );

// Stub @wordpress/components: real one transitively boots rich-text + data.
// PanelBody honours the controlled `opened` prop so toggle tests work.
jest.mock( '@wordpress/components', () => {
	const React = require( 'react' );
	return {
		Panel: ( { children, className }: any ) =>
			React.createElement( 'div', { className }, children ),
		PanelBody: ( { title, children, className, opened, onToggle }: any ) =>
			React.createElement(
				'section',
				{ className, 'data-testid': 'panel-body' },
				React.createElement(
					'button',
					{
						type: 'button',
						onClick: () => onToggle && onToggle( ! opened ),
					},
					title
				),
				opened !== false ? children : null
			),
	};
} );

const blocks = [
	{ clientId: 'b0', name: 'core/heading', attributes: { content: 'Council Update', level: 2 } },
	{
		clientId: 'b1',
		name: 'core/paragraph',
		attributes: { content: 'The council voted last Tuesday on the procedural matter.' },
	},
	{
		clientId: 'b2',
		name: 'core/paragraph',
		attributes: { content: 'Funding will be reallocated next quarter.' },
	},
];

function basePayload(
	overrides: Partial< React.ComponentProps< typeof ReviewMediation > > = {}
): React.ComponentProps< typeof ReviewMediation > {
	return {
		summary: 'Two reviewers disagree on the procedural framing.',
		conflicts: [],
		implications: [],
		suggested_edits: [],
		guideline_violations: [],
		...overrides,
	};
}

beforeEach( () => {
	mockApplyReviewEdit.mockReset();
	mockFindBlockElement.mockReset();
	mockFindBlockListLayout.mockReset();
	mockSelectBlock.mockReset();
	mockBlocks = blocks;
} );

describe( 'ReviewMediation — smoke render', () => {
	it( 'renders the summary and no stats chips when payload is empty', () => {
		render( <ReviewMediation { ...basePayload() } /> );

		expect(
			screen.getByText( 'Two reviewers disagree on the procedural framing.' )
		).toBeInTheDocument();

		// No conflicts/edits/etc — corresponding stats chips and panels absent.
		expect( screen.queryByText( /conflicts?$/i ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /^Conflicts$/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Suggested edits/ ) ).not.toBeInTheDocument();
		// Footer "Accept all" only renders when totalPendingCount > 0.
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders all five sections when the payload is fully populated', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Procedural framing',
							positions: [
								{ reviewer: 'Marcus', position: 'Wants to soften language.' },
								{ reviewer: 'Priya', position: 'Wants the original wording kept.' },
							],
							guideline_anchor: null,
							recommended_resolution: 'Use neutral phrasing.',
						},
					],
					implications: [
						{
							change: 'Tone shift',
							implies: 'May affect downstream FAQ wording.',
							affected_blocks: [ 1 ],
						},
					],
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'voted last Tuesday',
							suggested_text: 'voted on Tuesday',
							rationale: 'Concise.',
							supported_by_reviewers: [ 'Marcus' ],
						},
					],
					guideline_violations: [
						{
							category: 'copy',
							block_name: null,
							guideline_quote: 'Avoid passive voice.',
							block_index: 1,
							violating_text: 'was voted upon',
							issue: 'Passive voice detected.',
						},
					],
				} ) }
			/>
		);

		expect( screen.getByText( /Review summary/ ) ).toBeInTheDocument();
		expect( screen.getByText( 'Conflicts' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Implications' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Suggested edits' ) ).toBeInTheDocument();
		expect( screen.getByText( /Guideline violations/ ) ).toBeInTheDocument();

		// Category pill renders the literal category name in lowercase.
		expect( screen.getByText( 'copy' ) ).toBeInTheDocument();
		// Violating excerpt rendered in its own blockquote.
		expect( screen.getByText( 'was voted upon' ) ).toBeInTheDocument();
	} );
} );

describe( 'ReviewMediation — stats strip', () => {
	it( 'renders one button per non-empty section with the correct count', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'A',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: '',
						},
					],
					implications: [
						{ change: 'C1', implies: 'I1', affected_blocks: [] },
						{ change: 'C2', implies: 'I2', affected_blocks: [] },
					],
					suggested_edits: [
						{
							block_index: 1,
							current_text: '',
							suggested_text: 'x',
							rationale: '',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect( screen.getByTitle( 'Jump to conflicts' ) ).toBeInTheDocument();
		expect( screen.getByTitle( 'Jump to implications' ) ).toBeInTheDocument();
		expect( screen.getByTitle( 'Jump to suggested edits' ) ).toBeInTheDocument();
		expect( screen.queryByTitle( 'Jump to guideline violations' ) ).not.toBeInTheDocument();

		// Counts surface inside the stat-count span, not as standalone text.
		const implChip = screen.getByTitle( 'Jump to implications' );
		expect( implChip.textContent ).toMatch( /2/ );
	} );

	it( 'scrolls the matching section into view when a stat chip is clicked', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: '',
							suggested_text: 'tweak',
							rationale: '',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		const scrollSpy = ( window as any ).HTMLElement.prototype.scrollIntoView as jest.Mock;
		scrollSpy.mockClear();

		fireEvent.click( screen.getByTitle( 'Jump to suggested edits' ) );

		expect( scrollSpy ).toHaveBeenCalledTimes( 1 );
		expect( scrollSpy ).toHaveBeenCalledWith( { behavior: 'smooth', block: 'start' } );
	} );
} );

describe( 'ReviewMediation — suggested-edit accept flow', () => {
	const editsPayload = basePayload( {
		suggested_edits: [
			{
				block_index: 1,
				current_text: 'voted last Tuesday',
				suggested_text: 'voted on Tuesday',
				rationale: 'Concise.',
				supported_by_reviewers: [],
			},
		],
	} );

	it( 'applies the edit and collapses the card on Accept', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <ReviewMediation { ...editsPayload } /> );

		// Pre-accept: full card visible with rationale.
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday'
		);

		await waitFor( () => {
			expect( screen.getByText( 'Accepted' ) ).toBeInTheDocument();
		} );

		// Collapsed: rationale gone, Undo present.
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
	} );

	it( 'restores the full card from the collapsed row on Undo', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <ReviewMediation { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		// Back to pending: rationale + Accept button restored.
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeInTheDocument();
	} );

	it( 'marks the row failed (and not collapsed) when applyReviewEdit rejects', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: false } );

		render( <ReviewMediation { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByRole( 'button', { name: 'Retry' } ) ).toBeInTheDocument();
		} );
		// Card stays expanded on failure.
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
	} );

	it( 'collapses the card on Dismiss without calling applyReviewEdit', () => {
		render( <ReviewMediation { ...editsPayload } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.getByText( 'Dismissed' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'ReviewMediation — conflict resolutions', () => {
	const conflictPayload = basePayload( {
		conflicts: [
			{
				subject: 'Procedural framing',
				positions: [
					{ reviewer: 'Marcus', position: 'Soften.' },
					{ reviewer: 'Priya', position: 'Keep original.' },
				],
				guideline_anchor: null,
				recommended_resolution: 'Use neutral phrasing.',
				candidate_resolutions: [
					{
						source: 'reviewer',
						reviewer_name: 'Marcus',
						label: "Marcus's wording",
						block_index: 1,
						text: 'voted softly on Tuesday',
						rationale: '',
					},
					{
						source: 'ai',
						reviewer_name: null,
						label: 'AI resolution',
						block_index: 1,
						text: 'voted on Tuesday',
						rationale: '',
					},
				],
			},
		],
	} );

	it( 'applies the per-reviewer candidate when its button is clicked', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <ReviewMediation { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: "Accept Marcus's wording" } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted softly on Tuesday',
			undefined,
			undefined
		);
		await waitFor( () => {
			expect( screen.getByText( 'Accepted' ) ).toBeInTheDocument();
		} );
	} );

	it( 'applies the AI candidate when its button is clicked', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <ReviewMediation { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted on Tuesday',
			undefined,
			undefined
		);
	} );
} );

describe( 'ReviewMediation — bulk Accept all AI resolutions', () => {
	it( 'applies pending AI conflict candidate AND pending suggested edit sequentially', async () => {
		mockApplyReviewEdit.mockResolvedValue( { success: true } );

		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Procedural framing',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: '',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI',
									block_index: 1,
									text: 'AI rewrite',
									rationale: '',
								},
							],
						},
					],
					suggested_edits: [
						{
							block_index: 2,
							current_text: '',
							suggested_text: 'tighter copy',
							rationale: '',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		// Two pending: 1 AI conflict + 1 suggested edit.
		const footer = screen.getByRole( 'button', { name: /Accept all AI resolutions \(2\)/ } );
		await act( async () => {
			fireEvent.click( footer );
		} );

		await waitFor( () => {
			expect( mockApplyReviewEdit ).toHaveBeenCalledTimes( 2 );
		} );
		expect( mockApplyReviewEdit ).toHaveBeenNthCalledWith(
			1,
			'b1',
			'AI rewrite',
			undefined,
			undefined
		);
		expect( mockApplyReviewEdit ).toHaveBeenNthCalledWith( 2, 'b2', 'tighter copy', undefined, '' );

		// Footer disappears once everything is accepted (totalPendingCount === 0).
		await waitFor( () => {
			expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
		} );
	} );
} );

describe( 'ReviewMediation — cached-run hint', () => {
	it( 'renders a relative-time note when cached_at is set', () => {
		// 10 minutes ago.
		const cached_at = Math.floor( Date.now() / 1000 ) - 600;
		render( <ReviewMediation { ...basePayload( { cached_at } ) } /> );

		expect( screen.getByText( /Reusing mediation from .* ago/ ) ).toBeInTheDocument();
	} );

	it( 'omits the note when cached_at is not provided', () => {
		render( <ReviewMediation { ...basePayload() } /> );
		expect( screen.queryByText( /Reusing mediation/ ) ).not.toBeInTheDocument();
	} );
} );
