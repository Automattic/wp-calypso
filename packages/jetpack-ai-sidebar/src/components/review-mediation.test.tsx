/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import ReviewMediation from './review-mediation';

jest.mock( '@automattic/calypso-analytics', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

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
const mockUndoBlockEdit = jest.fn();
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

jest.mock( '../utils/block-actions', () => ( {
	applyReviewEdit: ( ...args: any[] ) => mockApplyReviewEdit( ...args ),
	findBlockElement: ( ...args: any[] ) => mockFindBlockElement( ...args ),
	findBlockListLayout: ( ...args: any[] ) => mockFindBlockListLayout( ...args ),
	isSupportedEditBlockType: ( blockName?: string | null ) =>
		[ 'core/paragraph', 'core/heading' ].includes( blockName ?? '' ),
	undoBlockEdit: ( ...args: any[] ) => mockUndoBlockEdit( ...args ),
} ) );

const mockSelectBlock = jest.fn();
let mockBlocks: any[] = [];
let mockCurrentPostId: number | null | undefined = 1;

jest.mock( '@wordpress/data', () => ( {
	useSelect: ( fn: any ) =>
		fn( ( store: string ) => {
			if ( store === 'core/block-editor' ) {
				return { getBlocks: () => mockBlocks };
			}
			if ( store === 'core/editor' ) {
				return { getCurrentPostId: () => mockCurrentPostId };
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
		postId: 1,
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
	mockUndoBlockEdit.mockReset();
	mockUndoBlockEdit.mockReturnValue( true );
	mockSelectBlock.mockReset();
	mockedRecordTracksEvent.mockClear();
	mockBlocks = blocks;
	mockCurrentPostId = 1;
	( window as any ).wp = {
		data: {
			select: ( store: string ) => {
				if ( store === 'core/editor' ) {
					return { getCurrentPostId: () => mockCurrentPostId };
				}
				return undefined;
			},
		},
	};
} );

afterEach( () => {
	delete ( window as any ).wp;
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
		expect( screen.getByText( 'Copy' ) ).toBeInTheDocument();
		// Violating excerpt rendered in its own blockquote.
		expect( screen.getByText( 'was voted upon' ) ).toBeInTheDocument();
	} );

	it( 'tracks the rendered result with aggregate counts', async () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					review_context: 'notes_and_guidelines',
					conflicts: [
						{
							subject: 'Procedural framing',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: '',
						},
					],
					implications: [
						{ change: 'Tone shift', implies: 'Update related FAQ.', affected_blocks: [ 1 ] },
					],
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'voted last Tuesday',
							suggested_text: 'voted on Tuesday',
							rationale: 'Concise.',
							supported_by_reviewers: [],
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

		await waitFor( () => {
			expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
				'jetpack_ai_editorial_review_result_rendered',
				{
					outcome: 'success',
					conflict_count: 1,
					implication_count: 1,
					suggested_edit_count: 1,
					guideline_violation_count: 1,
					review_context: 'notes_and_guidelines',
				}
			);
		} );
	} );

	it( 'marks a review for another post as stale and non-actionable', () => {
		// Review was generated for post 2 (postId prop); editor is currently on post 1 (mockCurrentPostId).
		render(
			<ReviewMediation
				{ ...basePayload( {
					postId: 2,
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
									label: 'AI resolution',
									block_index: 1,
									current_text: 'voted last Tuesday',
									text: 'voted on Tuesday',
									rationale: '',
								},
							],
						},
					],
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'voted last Tuesday',
							suggested_text: 'voted on Tuesday',
							rationale: 'Concise.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect(
			screen.getByText( 'Review context changed. Start a new chat and re-run this review.' )
		).toBeInTheDocument();
		expect( screen.getByTitle( 'Jump to conflicts' ) ).toBeDisabled();
		expect( screen.getByTitle( 'Jump to suggested edits' ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeDisabled();
		screen
			.getAllByRole( 'button', { name: 'Dismiss' } )
			.forEach( ( button ) => expect( button ).toBeDisabled() );
		expect(
			screen.getByRole( 'button', { name: /Accept all AI resolutions \(2\)/ } )
		).toBeDisabled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Suggested edits' } ) );
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Suggested edits' } ) );
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'marks a review without source post context as stale', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					postId: undefined,
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'voted last Tuesday',
							suggested_text: 'voted on Tuesday',
							rationale: 'Concise.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect(
			screen.getByText( 'Review context changed. Start a new chat and re-run this review.' )
		).toBeInTheDocument();
		expect( screen.getByTitle( 'Jump to suggested edits' ) ).toBeDisabled();
		expect( screen.getByRole( 'button', { name: 'Accept' } ) ).toBeDisabled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it.each( [
		[ 'null', null ],
		[ 'empty string', '' ],
		[ 'whitespace-only', '   ' ],
	] )(
		'filters guideline violations without a rendered guideline quote when the value is %s',
		( _label, quote ) => {
			render(
				<ReviewMediation
					{ ...basePayload( {
						guideline_violations: [
							{
								category: 'copy',
								block_name: null,
								guideline_quote: quote as string | null,
								block_index: 1,
								violating_text: 'was voted upon',
								issue: 'Reviewer-asserted with no matching site clause.',
							},
						],
					} ) }
				/>
			);

			expect(
				screen.queryByText( /Reviewer-asserted with no matching site clause/ )
			).not.toBeInTheDocument();
			expect( screen.queryByText( /Guideline violations/ ) ).not.toBeInTheDocument();
			expect(
				document.querySelector( '.jetpack-ai-review-mediation__guideline-anchor' )
			).toBeNull();
		}
	);
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
			'voted last Tuesday',
			expect.any( Function )
		);

		await waitFor( () => {
			expect( screen.getByText( 'Accepted' ) ).toBeInTheDocument();
		} );
		expect( mockedRecordTracksEvent ).toHaveBeenCalledWith(
			'jetpack_ai_editorial_review_item_action',
			{
				action: 'accept',
				target: 'edit',
				outcome: 'success',
			}
		);

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

	it( 'reverts the block content via undoBlockEdit on Undo', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );

		render( <ReviewMediation { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledWith(
			'b1',
			'The council voted last Tuesday on the procedural matter.',
			'The council voted on Tuesday on the procedural matter.'
		);
	} );

	it( 'keeps the accepted row and snapshot when undoBlockEdit fails', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );
		mockUndoBlockEdit.mockReturnValueOnce( false ).mockReturnValueOnce( true );

		render( <ReviewMediation { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Accepted' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 2 );
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
		expect(
			screen.getByText( 'Could not apply automatically. The original text may have changed.' )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
	} );

	it( 'disables Accept for unsupported block targets', () => {
		mockBlocks = [
			...blocks,
			{ clientId: 'b3', name: 'core/list', attributes: { content: 'List content' } },
		];

		render(
			<ReviewMediation
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 3,
							current_text: 'List content',
							suggested_text: 'Updated list content',
							rationale: 'Lists are not supported by automatic block edits.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect( screen.getByText( 'Needs manual edit — unsupported block type' ) ).toBeInTheDocument();
		const accept = screen.getByRole( 'button', { name: 'Accept' } );
		expect( accept ).toBeDisabled();
		fireEvent.click( accept );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders manual suggested edits without making them auto-applicable', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: '',
							suggested_text: 'Review the paragraph against the concern before publishing.',
							rationale: 'Marcus raised this as a policy concern.',
							supported_by_reviewers: [ 'Marcus' ],
							requires_manual: true,
						},
					],
				} ) }
			/>
		);

		expect(
			screen.getByText( 'Review the paragraph against the concern before publishing.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Marcus raised this as a policy concern.' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Requested by:' ) ).toBeInTheDocument();

		expect( screen.getByText( 'Needs manual edit.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Needs manual edit' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Accept' } ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it( 'keeps block focus on the explicit block reference button', () => {
		const blockElement = document.createElement( 'div' );
		const layoutElement = document.createElement( 'div' );
		mockFindBlockElement.mockReturnValue( blockElement );
		mockFindBlockListLayout.mockReturnValue( layoutElement );

		render( <ReviewMediation { ...editsPayload } /> );

		const card = screen.getByText( 'Concise.' ).closest( '.jetpack-ai-review-mediation__card' );
		expect( card ).toBeInTheDocument();

		fireEvent.click( card! );
		expect( mockSelectBlock ).not.toHaveBeenCalled();

		fireEvent.click( screen.getByTitle( 'Scroll to block in editor' ) );
		expect( mockSelectBlock ).toHaveBeenCalledWith( 'b1' );
		expect( mockFindBlockElement ).toHaveBeenCalledWith( 'b1' );
		expect( layoutElement.classList.contains( 'is-focus-mode' ) ).toBe( true );
	} );

	it( 'maps block_index against the recursive flattened block tree', async () => {
		mockBlocks = [
			{
				clientId: 'empty-wrapper',
				attributes: {},
				innerBlocks: [
					{
						clientId: 'ignored-nested',
						name: 'core/paragraph',
						attributes: { content: 'Ignored nested paragraph.' },
					},
				],
			},
			{
				clientId: 'group-0',
				name: 'core/group',
				attributes: {},
				innerBlocks: [
					{
						clientId: 'nested-1',
						name: 'core/paragraph',
						attributes: { content: 'Nested paragraph text.' },
					},
				],
			},
		];
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render(
			<ReviewMediation
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'Nested paragraph text.',
							suggested_text: 'Updated nested paragraph text.',
							rationale: 'Nested block edit.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'nested-1',
			'Updated nested paragraph text.',
			undefined,
			'Nested paragraph text.',
			expect.any( Function )
		);
	} );

	it( 'disables Accept when the source text no longer matches the block content', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'outdated text',
							suggested_text: 'fresh text',
							rationale: 'Avoid stale source edits.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect( screen.getByText( 'Needs manual edit — source text changed' ) ).toBeInTheDocument();
		const accept = screen.getByRole( 'button', { name: 'Accept' } );
		expect( accept ).toBeDisabled();
		fireEvent.click( accept );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
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
						current_text: 'voted last Tuesday',
						text: 'voted softly on Tuesday',
						rationale: '',
					},
					{
						source: 'ai',
						reviewer_name: null,
						label: 'AI resolution',
						block_index: 1,
						current_text: 'voted last Tuesday',
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
			'voted last Tuesday',
			expect.any( Function )
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
			'voted last Tuesday',
			expect.any( Function )
		);
	} );

	it( 'keeps the accepted conflict and snapshot when undoBlockEdit fails', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );
		mockUndoBlockEdit.mockReturnValueOnce( false ).mockReturnValueOnce( true );

		render( <ReviewMediation { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledWith(
			'b1',
			'The council voted last Tuesday on the procedural matter.',
			'The council voted on Tuesday on the procedural matter.'
		);
		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Accepted' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();
		expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 2 );
		expect( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) ).toBeInTheDocument();
	} );

	it( 'renders unsupported conflict candidates as manual guidance without accept buttons', () => {
		mockBlocks = [
			...blocks,
			{ clientId: 'b3', name: 'core/list', attributes: { content: 'List content' } },
		];

		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'List wording',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: 'Use the AI wording.',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI resolution',
									block_index: 3,
									text: 'Updated list content',
									rationale: '',
								},
							],
						},
					],
				} ) }
			/>
		);

		expect( screen.getByText( 'Needs manual edit — unsupported block type' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeInTheDocument();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders post-wide conflict candidates as manual guidance without accept buttons', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Article-wide framing',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: 'Review the article framing manually.',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI resolution',
									block_index: null,
									current_text: '',
									text: 'Review the article framing manually.',
									rationale: '',
								},
							],
						},
					],
				} ) }
			/>
		);

		expect( screen.getByText( 'Needs manual edit — no single block target' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeInTheDocument();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders conflict candidates without exact source text as manual guidance', () => {
		render(
			<ReviewMediation
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Procedural framing',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: 'Use the AI wording.',
							candidate_resolutions: [
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
				} ) }
			/>
		);

		expect( screen.getByText( 'Needs manual edit — no exact source text' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeInTheDocument();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
	} );

	it.each( [
		[ 'separate matches', 'Use neutral language. Use neutral language.', 'Use neutral language.' ],
		[ 'overlapping matches', 'banana', 'ana' ],
	] )(
		'renders conflict candidates as manual guidance when the source text has %s',
		( _label, content, currentText ) => {
			mockBlocks = [
				{
					clientId: 'repeat',
					name: 'core/paragraph',
					attributes: { content },
				},
			];

			render(
				<ReviewMediation
					{ ...basePayload( {
						conflicts: [
							{
								subject: 'Repeated source text',
								positions: [],
								guideline_anchor: null,
								recommended_resolution: 'Use the AI wording.',
								candidate_resolutions: [
									{
										source: 'ai',
										reviewer_name: null,
										label: 'AI resolution',
										block_index: 0,
										current_text: currentText,
										text: 'Use clearer neutral language.',
										rationale: '',
									},
								],
							},
						],
					} ) }
				/>
			);

			expect(
				screen.getByText( 'Needs manual edit — source text appears more than once' )
			).toBeInTheDocument();
			expect(
				screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
			).not.toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeInTheDocument();

			expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
			expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
		}
	);
} );

describe( 'ReviewMediation — bulk Accept all AI resolutions', () => {
	it( 'applies only supported pending edits sequentially', async () => {
		mockApplyReviewEdit.mockResolvedValue( { success: true } );
		mockBlocks = [
			...blocks,
			{ clientId: 'b3', name: 'core/list', attributes: { content: 'List content' } },
			{ clientId: 'b4', name: 'core/image', attributes: { content: 'Image content' } },
		];

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
									current_text: 'voted last Tuesday',
									text: 'AI rewrite',
									rationale: '',
								},
							],
						},
						{
							subject: 'List wording',
							positions: [],
							guideline_anchor: null,
							recommended_resolution: '',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI',
									block_index: 3,
									text: 'Unsupported rewrite',
									rationale: '',
								},
							],
						},
					],
					suggested_edits: [
						{
							block_index: 2,
							current_text: 'Funding',
							suggested_text: 'tighter copy',
							rationale: '',
							supported_by_reviewers: [],
						},
						{
							block_index: 4,
							current_text: '',
							suggested_text: 'unsupported image text',
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
			'voted last Tuesday',
			expect.any( Function )
		);
		expect( mockApplyReviewEdit ).toHaveBeenNthCalledWith(
			2,
			'b2',
			'tighter copy',
			undefined,
			'Funding',
			expect.any( Function )
		);

		// Footer disappears once everything is accepted (totalPendingCount === 0).
		await waitFor( () => {
			expect( screen.queryByText( /Accept all AI resolutions/ ) ).not.toBeInTheDocument();
		} );
	} );

	it( 'stops bulk applying when the editor navigates to another post mid-run', async () => {
		let resolveFirstApply: ( value: { success: boolean } ) => void = () => {};
		mockApplyReviewEdit.mockImplementationOnce(
			() =>
				new Promise( ( resolve ) => {
					resolveFirstApply = resolve;
				} )
		);

		const payload = basePayload( {
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
							current_text: 'voted last Tuesday',
							text: 'AI rewrite',
							rationale: '',
						},
					],
				},
			],
			suggested_edits: [
				{
					block_index: 2,
					current_text: 'Funding',
					suggested_text: 'tighter copy',
					rationale: '',
					supported_by_reviewers: [],
				},
			],
		} );
		const { rerender } = render( <ReviewMediation { ...payload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: /Accept all AI resolutions \(2\)/ } ) );
		} );

		await waitFor( () => {
			expect( mockApplyReviewEdit ).toHaveBeenCalledTimes( 1 );
		} );

		mockCurrentPostId = 2;
		rerender( <ReviewMediation { ...payload } /> );

		await act( async () => {
			resolveFirstApply( { success: true } );
		} );

		await waitFor( () => {
			expect(
				screen.getByText( 'Review context changed. Start a new chat and re-run this review.' )
			).toBeInTheDocument();
		} );
		expect( mockApplyReviewEdit ).toHaveBeenCalledTimes( 1 );
		expect(
			screen.getByRole( 'button', { name: /Accept all AI resolutions \(2\)/ } )
		).toBeDisabled();
	} );
} );

describe( 'ReviewMediation — cached-run hint', () => {
	it( 'renders a relative-time note when cached_at is set', () => {
		// 10 minutes ago.
		const cached_at = Math.floor( Date.now() / 1000 ) - 600;
		render( <ReviewMediation { ...basePayload( { cached_at } ) } /> );

		expect( screen.getByText( /Reusing review from .* ago/ ) ).toBeInTheDocument();
	} );

	it( 'omits the note when cached_at is not provided', () => {
		render( <ReviewMediation { ...basePayload() } /> );
		expect( screen.queryByText( /Reusing review/ ) ).not.toBeInTheDocument();
	} );
} );
