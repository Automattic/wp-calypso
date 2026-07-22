/**
 * @jest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';
import AiEditorialReview from './ai-editorial-review';

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
const mockClearActiveBlockFocus = jest.fn();
const mockClearActiveBlockFocusUnlessBlockReferenceClick = jest.fn();
const mockToggleBlockReferenceFocus = jest.fn();
const mockUndoBlockEdit = jest.fn();
const mockedRecordTracksEvent = recordTracksEvent as jest.MockedFunction<
	typeof recordTracksEvent
>;

jest.mock( '../utils/block-actions', () => ( {
	applyReviewEdit: ( ...args: any[] ) => mockApplyReviewEdit( ...args ),
	clearActiveBlockFocus: ( ...args: any[] ) => mockClearActiveBlockFocus( ...args ),
	clearActiveBlockFocusUnlessBlockReferenceClick: ( ...args: any[] ) =>
		mockClearActiveBlockFocusUnlessBlockReferenceClick( ...args ),
	getEditableBlockContent: ( block: any, attributeName?: string, currentText?: string ) => {
		if ( attributeName ) {
			return block?.attributes?.[ attributeName ] ?? '';
		}
		const attributeNames = Object.keys( block?.attributes ?? {} ).filter(
			( key ) => typeof block?.attributes?.[ key ] === 'string'
		);
		const currentTextMatches = attributeNames.filter(
			( key ) => currentText && block.attributes[ key ].includes( currentText )
		);
		if ( currentTextMatches.length === 1 ) {
			return block.attributes[ currentTextMatches[ 0 ] ];
		}
		return (
			block?.attributes?.content ??
			( attributeNames.length === 1 ? block.attributes[ attributeNames[ 0 ] ] : '' )
		);
	},
	hasEditableBlockTarget: ( block: any, attributeName?: string, currentText?: string ) => {
		if ( attributeName ) {
			return typeof block?.attributes?.[ attributeName ] === 'string';
		}
		const attributeNames = Object.keys( block?.attributes ?? {} ).filter(
			( key ) => typeof block?.attributes?.[ key ] === 'string'
		);
		const currentTextMatches = attributeNames.filter(
			( key ) => currentText && block.attributes[ key ].includes( currentText )
		);
		return (
			currentTextMatches.length === 1 ||
			typeof block?.attributes?.content === 'string' ||
			attributeNames.length === 1
		);
	},
	toggleBlockReferenceFocus: ( ...args: any[] ) => mockToggleBlockReferenceFocus( ...args ),
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
				return {
					getCurrentPostId: () => mockCurrentPostId,
					getCurrentPostType: () => 'post',
					getRenderingMode: () => 'post-only',
				};
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

// BlockRef renders the block-type icon via BlockIcon; stub it and the block
// registry so the real block-editor module (which needs @wordpress/data) is not
// pulled in under the mocked data store.
jest.mock( '@wordpress/block-editor', () => ( {
	store: 'core/block-editor',
	BlockIcon: () => null,
	RichText: {
		Content: ( { tagName = 'div', value, ...props }: Record< string, unknown > ) => {
			const react = jest.requireActual< typeof import('react') >( 'react' );
			const { RawHTML } =
				jest.requireActual< typeof import('@wordpress/element') >( '@wordpress/element' );
			return react.createElement(
				tagName as string,
				props,
				react.createElement( RawHTML, null, value as string )
			);
		},
	},
} ) );
jest.mock( '@wordpress/blocks', () => ( {
	getBlockType: () => undefined,
} ) );

// Stub @wordpress/components: real one transitively boots rich-text + data.
// PanelBody honours the controlled `opened` prop so toggle tests work.
jest.mock( '@wordpress/components', () => {
	const React = jest.requireActual< typeof import('react') >( 'react' );
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
	overrides: Partial< React.ComponentProps< typeof AiEditorialReview > > = {}
): React.ComponentProps< typeof AiEditorialReview > {
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
	mockClearActiveBlockFocus.mockReset();
	mockClearActiveBlockFocusUnlessBlockReferenceClick.mockReset();
	mockToggleBlockReferenceFocus.mockReset();
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

describe( 'AiEditorialReview — smoke render', () => {
	it( 'renders the summary and no stats chips when payload is empty', () => {
		render( <AiEditorialReview { ...basePayload() } /> );

		expect(
			screen.getByText( 'Two reviewers disagree on the procedural framing.' )
		).toBeInTheDocument();

		// No conflicts/edits/etc — corresponding stats chips and panels absent.
		expect( screen.queryByText( /conflicts?$/i ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /^Conflicts$/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Suggested edits/ ) ).not.toBeInTheDocument();
		// Footer "Accept all" only renders when totalPendingCount > 0.
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders all five sections when the payload is fully populated', () => {
		render(
			<AiEditorialReview
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
		// The violation renders as a card badged with its category + position.
		expect( screen.getByText( 'Copy (1/1)' ) ).toBeInTheDocument();
		// The violating excerpt is shown (struck through) and the guideline is quoted.
		expect( screen.getByText( 'was voted upon' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Avoid passive voice.' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Passive voice detected.' ) ).toBeInTheDocument();
	} );

	it( 'tracks the rendered result with aggregate counts', async () => {
		render(
			<AiEditorialReview
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
			<AiEditorialReview
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
		// Stale → the edit can't one-click apply EVEN THOUGH the current post still
		// contains the source text: Go to section (disabled) stands in for a dead
		// Apply, and the card is not tagged "Manual edit".
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeDisabled();
		expect( screen.queryByText( 'Manual edit' ) ).not.toBeInTheDocument();
		screen
			.getAllByRole( 'button', { name: 'Dismiss' } )
			.forEach( ( button ) => expect( button ).toBeDisabled() );
		expect( screen.getByRole( 'button', { name: /Apply all \(2\)/ } ) ).toBeDisabled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Suggested edits' } ) );
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Suggested edits' } ) );
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();

		// Nothing was applied.
		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'marks a review without source post context as stale', () => {
		render(
			<AiEditorialReview
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
		// Stale (no source post) → Go to section (disabled), not a dead Apply.
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeDisabled();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( mockedRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'does not tag a stale AER edit "Manual edit" even when the source text is absent', () => {
		// Editor moved to post 999 (stale) AND the current block doesn't contain the
		// edit's source text — so the frontend reason is truthy. Without the
		// !isPostStale gate the card would wrongly show a "Manual edit" tag.
		mockCurrentPostId = 999;
		render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'text that is not present in this block',
							suggested_text: 'a replacement',
							rationale: 'Concise.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		expect( screen.queryByText( 'Manual edit' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeDisabled();
	} );

	it.each( [
		[ 'null', null ],
		[ 'empty string', '' ],
		[ 'whitespace-only', '   ' ],
	] )(
		'filters guideline violations without a rendered guideline quote when the value is %s',
		( _label, quote ) => {
			render(
				<AiEditorialReview
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
			// No card renders for the filtered violation, so its excerpt is absent too.
			expect( screen.queryByText( 'was voted upon' ) ).not.toBeInTheDocument();
		}
	);
} );

describe( 'AiEditorialReview — stats strip', () => {
	it( 'renders one button per non-empty section with the correct count', () => {
		render(
			<AiEditorialReview
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
			<AiEditorialReview
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

describe( 'AiEditorialReview — suggested-edit accept flow', () => {
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

		render( <AiEditorialReview { ...editsPayload } /> );

		// Pre-accept: full card visible with rationale.
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday',
			expect.any( Function ),
			undefined
		);

		await waitFor( () => {
			expect( screen.getByText( 'Applied' ) ).toBeInTheDocument();
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

	it( 'falls to Go to section, not a stuck Applying, if the review goes stale mid-apply', async () => {
		// A never-resolving apply keeps the card in the in-flight "Applying…" state.
		mockApplyReviewEdit.mockReturnValueOnce( new Promise( () => undefined ) );

		const { rerender } = render( <AiEditorialReview { ...editsPayload } /> );
		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );
		expect( screen.getByRole( 'button', { name: 'Applying…' } ) ).toBeInTheDocument();

		// The editor navigates to another post while the apply is still in flight.
		mockCurrentPostId = 999;
		rerender( <AiEditorialReview { ...editsPayload } /> );

		// No stuck Apply/Applying button — Go to section (disabled) stands in.
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Applying…' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeDisabled();
	} );

	it( 'passes the editable attribute from the payload to one-click edits', async () => {
		mockBlocks = [
			{
				clientId: 'image-1',
				name: 'core/image',
				attributes: { caption: 'Outdoor map activity' },
			},
		];
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			editableAttribute: 'caption',
		} );

		render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 0,
							editable_attribute: 'caption',
							current_text: 'Outdoor map activity',
							suggested_text: 'Children exploring an outdoor map',
							rationale: 'Clarify image context.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'image-1',
			'Children exploring an outdoor map',
			undefined,
			'Outdoor map activity',
			expect.any( Function ),
			'caption'
		);
	} );

	it( 'restores the full card from the collapsed row on Undo', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <AiEditorialReview { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		// Back to pending: rationale + Accept button restored.
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Apply change' } ) ).toBeInTheDocument();
	} );

	it( 'reverts the block content via undoBlockEdit on Undo', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );

		render( <AiEditorialReview { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledWith(
			'b1',
			'The council voted last Tuesday on the procedural matter.',
			'The council voted on Tuesday on the procedural matter.',
			undefined
		);
	} );

	it( 'keeps the accepted row and snapshot when undoBlockEdit fails', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );
		mockUndoBlockEdit.mockReturnValueOnce( false ).mockReturnValueOnce( true );

		render( <AiEditorialReview { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();
		} );

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Applied' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Undo' ) ).toBeInTheDocument();

		fireEvent.click( screen.getByText( 'Undo' ) );

		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 2 );
		expect( screen.getByText( 'Concise.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Apply change' } ) ).toBeInTheDocument();
	} );

	it( 'marks the row failed (and not collapsed) when applyReviewEdit rejects', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: false } );

		render( <AiEditorialReview { ...editsPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
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

	it( 'offers Go to section instead of Apply when the block has no editable text target', () => {
		mockBlocks = [ ...blocks, { clientId: 'b3', name: 'core/query', attributes: { queryId: 1 } } ];

		render(
			<AiEditorialReview
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

		// No dead Apply: the fix can't apply, so Go to section stands in (block exists).
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		const goToSection = screen.getByRole( 'button', { name: 'Go to section' } );
		expect( goToSection ).not.toBeDisabled();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders manual suggested edits without making them auto-applicable', () => {
		render(
			<AiEditorialReview
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

		// Manual-edit badge; WHY = rationale, SUGGESTION = the proposed wording.
		expect( screen.getByText( 'Manual edit' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Marcus raised this as a policy concern.' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'Review the paragraph against the concern before publishing.' )
		).toBeInTheDocument();
		expect( screen.getByText( 'Requested by:' ) ).toBeInTheDocument();

		// No in-place Apply on a manual card; Go to section instead.
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeInTheDocument();
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'badges edits with feedback_category and keeps that category on a Manual edit', () => {
		render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'voted last Tuesday',
							suggested_text: 'voted on Tuesday',
							rationale: 'Concise.',
							supported_by_reviewers: [],
							feedback_category: 'Tone',
						},
						{
							block_index: 1,
							current_text: '',
							suggested_text: 'Rework this paragraph before publishing.',
							rationale: 'Needs author judgment.',
							supported_by_reviewers: [],
							requires_manual: true,
							feedback_category: 'Clarity',
						},
					],
				} ) }
			/>
		);

		// Applicable edit: badge is its feedback_category, no "Manual edit" tag.
		expect( screen.getByText( 'Tone (1/2)' ) ).toBeInTheDocument();
		// Manual edit: the category badge STAYS; "Manual edit" is a separate tag.
		expect( screen.getByText( 'Clarity (2/2)' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Manual edit' ) ).toBeInTheDocument();
	} );

	it( 'keeps block focus on the explicit block reference button', () => {
		render( <AiEditorialReview { ...editsPayload } /> );

		const card = screen.getByText( 'Concise.' ).closest( '.jetpack-ai-feedback-list__item' );
		expect( card ).toBeInTheDocument();

		fireEvent.mouseDown( card! );
		expect( mockSelectBlock ).not.toHaveBeenCalled();
		expect( mockToggleBlockReferenceFocus ).not.toHaveBeenCalled();
		expect( mockClearActiveBlockFocusUnlessBlockReferenceClick ).toHaveBeenCalledWith( card );

		const blockRef = screen.getByTitle( 'Scroll to block in editor' );
		fireEvent.mouseDown( blockRef );
		fireEvent.click( blockRef );
		expect( mockToggleBlockReferenceFocus ).toHaveBeenCalledWith( 'b1' );
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
			<AiEditorialReview
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
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'nested-1',
			'Updated nested paragraph text.',
			undefined,
			'Nested paragraph text.',
			expect.any( Function ),
			undefined
		);
	} );

	it( 'offers Go to section instead of Apply when the source text no longer matches', () => {
		render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 1,
							current_text: 'outdated text',
							suggested_text: '<strong>fresh</strong> text',
							suggested_text_html: '<strong>fresh</strong> text',
							rationale: 'Avoid stale source edits.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		// The drifted source can't apply, so no Apply change; Go to section stands in.
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).not.toBeDisabled();
		const suggestion = document.querySelector(
			'.jetpack-ai-feedback-list__diff-row.is-new .jetpack-ai-feedback-list__diff-content'
		);
		expect( suggestion?.tagName ).toBe( 'DIV' );
		expect( suggestion?.querySelector( 'strong' ) ).toHaveTextContent( 'fresh' );
		expect( document.querySelector( 'span > div' ) ).not.toBeInTheDocument();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'collapses the card on Dismiss without calling applyReviewEdit', () => {
		render( <AiEditorialReview { ...editsPayload } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.getByText( 'Dismissed' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Concise.' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'AiEditorialReview — guideline violations', () => {
	const violationsPayload = basePayload( {
		guideline_violations: [
			{
				category: 'copy',
				block_name: null,
				guideline_quote: 'Write in the active voice.',
				block_index: 1,
				violating_text: 'was voted upon',
				issue: 'Passive voice detected.',
			},
		],
	} );

	it( 'renders a violation as an advisory card — badge, struck excerpt, why, guideline, no Apply', () => {
		render( <AiEditorialReview { ...violationsPayload } /> );

		// Section heading carries the count, like the other grouped sections.
		expect( screen.getByText( /Guideline violations \(1\)/ ) ).toBeInTheDocument();
		// Category + position badge instead of a standalone pill.
		expect( screen.getByText( 'Copy (1/1)' ) ).toBeInTheDocument();
		// The violating excerpt is struck through; WHY (issue) + GUIDELINE (quote) rows follow.
		const excerpt = screen.getByText( 'was voted upon' );
		expect( excerpt.tagName ).toBe( 'DEL' );
		expect( screen.getByText( 'Passive voice detected.' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Write in the active voice.' ) ).toBeInTheDocument();
		// Why-first order: Why (issue) → struck excerpt → guideline quote.
		const tags = Array.from(
			document.querySelectorAll( '.jetpack-ai-feedback-list__diff-tag' )
		).map( ( n ) => n.textContent );
		expect( tags ).toEqual( [ 'Why', 'Current', 'Guideline' ] );
		// Advisory: nothing to apply, so Go to section stands in for Apply change.
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).not.toBeDisabled();
	} );

	it( 'focuses the referenced block when Go to section is clicked', () => {
		render( <AiEditorialReview { ...violationsPayload } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Go to section' } ) );
		expect( mockToggleBlockReferenceFocus ).toHaveBeenCalledWith( 'b1' );
	} );

	it( 'collapses to a Dismissed row on Dismiss and restores the card on Undo', () => {
		render( <AiEditorialReview { ...violationsPayload } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		// Resolved: body hidden, Dismissed + Undo shown, and no block mutation ran.
		expect( screen.queryByText( 'Passive voice detected.' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Dismissed' ) ).toBeInTheDocument();
		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( mockUndoBlockEdit ).not.toHaveBeenCalled();

		fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );

		// Back to the active advisory card.
		expect( screen.getByText( 'Passive voice detected.' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeInTheDocument();
	} );

	it( 'disables Go to section when the referenced block is gone and omits the excerpt row', () => {
		render(
			<AiEditorialReview
				{ ...basePayload( {
					guideline_violations: [
						{
							category: 'images',
							block_name: null,
							guideline_quote: 'Provide descriptive alt text.',
							block_index: 42,
							violating_text: '',
							issue: 'Alt text missing.',
						},
					],
				} ) }
			/>
		);

		// Out-of-range block index → nothing to anchor to.
		expect( screen.getByRole( 'button', { name: 'Go to section' } ) ).toBeDisabled();
		// Empty violating_text → no struck excerpt row, but the issue still renders.
		expect( screen.getByText( 'Alt text missing.' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'was voted upon' ) ).not.toBeInTheDocument();
	} );
} );

describe( 'AiEditorialReview — conflict resolutions', () => {
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

		render( <AiEditorialReview { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: "Accept Marcus's wording" } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted softly on Tuesday',
			undefined,
			'voted last Tuesday',
			expect.any( Function ),
			undefined
		);
		await waitFor( () => {
			expect( screen.getByText( 'Applied' ) ).toBeInTheDocument();
		} );
	} );

	it( 'applies the AI candidate when its button is clicked', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <AiEditorialReview { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'b1',
			'voted on Tuesday',
			undefined,
			'voted last Tuesday',
			expect.any( Function ),
			undefined
		);
	} );

	it( 'groups reviewer options separately from the fixed AI + Dismiss pair', () => {
		// Three reviewers (odd count) + an AI recommendation: the reviewer options
		// must stay in their own group and the AI + Dismiss pair must stay fixed,
		// so the pairing never depends on the reviewer count's parity.
		render(
			<AiEditorialReview
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Procedural framing',
							positions: [
								{ reviewer: 'Ada', position: 'A.' },
								{ reviewer: 'Ben', position: 'B.' },
								{ reviewer: 'Cai', position: 'C.' },
							],
							guideline_anchor: null,
							recommended_resolution: 'Use neutral phrasing.',
							candidate_resolutions: [
								...[ 'Ada', 'Ben', 'Cai' ].map( ( name ) => ( {
									source: 'reviewer' as const,
									reviewer_name: name,
									label: `${ name }'s wording`,
									block_index: 1,
									current_text: 'voted last Tuesday',
									text: `voted per ${ name }`,
									rationale: '',
								} ) ),
								{
									source: 'ai' as const,
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
				} ) }
			/>
		);

		const candidates = document.querySelector(
			'.jetpack-ai-editorial-review__conflict-candidates'
		);
		const resolve = document.querySelector(
			'.jetpack-ai-editorial-review__conflict-resolution .jetpack-ai-editorial-review__actions'
		);
		expect( candidates ).toBeInTheDocument();
		expect( resolve ).toBeInTheDocument();

		// All three reviewer options are in the candidates group, none in the pair.
		for ( const name of [
			"Accept Ada's wording",
			"Accept Ben's wording",
			"Accept Cai's wording",
		] ) {
			const btn = screen.getByRole( 'button', { name } );
			expect( candidates ).toContainElement( btn );
			expect( resolve ).not.toContainElement( btn );
		}

		// AI + Dismiss are the fixed pair, not mixed into the reviewer grid.
		const ai = screen.getByRole( 'button', { name: 'Accept AI resolution' } );
		const dismiss = screen.getByRole( 'button', { name: 'Dismiss' } );
		expect( resolve ).toContainElement( ai );
		expect( resolve ).toContainElement( dismiss );
		expect( candidates ).not.toContainElement( ai );
		expect( candidates ).not.toContainElement( dismiss );
	} );

	it( 'resolves in place on accept — keeps the header, shows Applied + Undo, and Undo restores the options', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		render( <AiEditorialReview { ...conflictPayload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) );
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Applied' ) ).toBeInTheDocument();
		} );
		// Not collapsed to a one-liner: the subject header stays, and the row
		// offers Undo — the shared resolved shape from GF / Proofreader.
		expect( screen.getByText( 'Procedural framing' ) ).toBeInTheDocument();
		// The undo icon is an aria-hidden SVG, so match the button by its text.
		const undoBtn = screen.getByText( 'Undo' );
		expect( undoBtn ).toBeInTheDocument();
		// The active resolution options are gone while resolved.
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();

		fireEvent.click( undoBtn );

		// Undo brings back the active card with its resolution options.
		expect( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Applied' ) ).not.toBeInTheDocument();
	} );

	it( 'keeps the accepted conflict and snapshot when undoBlockEdit fails', async () => {
		mockApplyReviewEdit.mockResolvedValueOnce( {
			success: true,
			contentBefore: 'The council voted last Tuesday on the procedural matter.',
			contentAfter: 'The council voted on Tuesday on the procedural matter.',
		} );
		mockUndoBlockEdit.mockReturnValueOnce( false ).mockReturnValueOnce( true );

		render( <AiEditorialReview { ...conflictPayload } /> );

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
			'The council voted on Tuesday on the procedural matter.',
			undefined
		);
		expect( mockUndoBlockEdit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByText( 'Applied' ) ).toBeInTheDocument();
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
			<AiEditorialReview
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

		expect( screen.getByText( 'Needs manual edit — no exact source text' ) ).toBeInTheDocument();
		expect(
			screen.queryByRole( 'button', { name: 'Accept AI resolution' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Dismiss' } ) ).toBeInTheDocument();

		expect( mockApplyReviewEdit ).not.toHaveBeenCalled();
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders post-wide conflict candidates as manual guidance without accept buttons', () => {
		render(
			<AiEditorialReview
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
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
	} );

	it( 'renders conflict candidates without exact source text as manual guidance', () => {
		render(
			<AiEditorialReview
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
		expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
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
				<AiEditorialReview
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
			expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
		}
	);
} );

describe( 'AiEditorialReview — bulk Apply all', () => {
	it( 'applies only supported pending edits sequentially', async () => {
		mockApplyReviewEdit.mockResolvedValue( { success: true } );
		mockBlocks = [
			...blocks,
			{ clientId: 'b3', name: 'core/list', attributes: { content: 'List content' } },
			{ clientId: 'b4', name: 'core/image', attributes: { content: 'Image content' } },
		];

		render(
			<AiEditorialReview
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
		const footer = screen.getByRole( 'button', { name: /Apply all \(2\)/ } );
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
			expect.any( Function ),
			undefined
		);
		expect( mockApplyReviewEdit ).toHaveBeenNthCalledWith(
			2,
			'b2',
			'tighter copy',
			undefined,
			'Funding',
			expect.any( Function ),
			undefined
		);

		// Footer disappears once everything is accepted (totalPendingCount === 0).
		await waitFor( () => {
			expect( screen.queryByText( /Apply all/ ) ).not.toBeInTheDocument();
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
		const { rerender } = render( <AiEditorialReview { ...payload } /> );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: /Apply all \(2\)/ } ) );
		} );

		await waitFor( () => {
			expect( mockApplyReviewEdit ).toHaveBeenCalledTimes( 1 );
		} );

		mockCurrentPostId = 2;
		rerender( <AiEditorialReview { ...payload } /> );

		await act( async () => {
			resolveFirstApply( { success: true } );
		} );

		await waitFor( () => {
			expect(
				screen.getByText( 'Review context changed. Start a new chat and re-run this review.' )
			).toBeInTheDocument();
		} );
		expect( mockApplyReviewEdit ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByRole( 'button', { name: /Apply all \(2\)/ } ) ).toBeDisabled();
	} );
} );

describe( 'AiEditorialReview — cached-run hint', () => {
	it( 'renders a relative-time note when cached_at is set', () => {
		// 10 minutes ago.
		const cached_at = Math.floor( Date.now() / 1000 ) - 600;
		render( <AiEditorialReview { ...basePayload( { cached_at } ) } /> );

		expect( screen.getByText( /Reusing review from .* ago/ ) ).toBeInTheDocument();
	} );

	it( 'omits the note when cached_at is not provided', () => {
		render( <AiEditorialReview { ...basePayload() } /> );
		expect( screen.queryByText( /Reusing review/ ) ).not.toBeInTheDocument();
	} );
} );

describe( 'AiEditorialReview — HTML fragment display', () => {
	const currentFragment =
		'<strong><em>Consultation</em></strong> <em>opens</em>s on next week, <s>not this week</s>, ref<sup>2</sup>';
	const replacementFragment =
		'<strong><em>Consultation</em></strong> <em>opens</em> on next week, <s>not this week</s>, ref<sup>2</sup>';
	const formattedBlocks = [
		{
			clientId: 'f0',
			name: 'core/list-item',
			attributes: { content: currentFragment },
		},
	];

	it( 'renders server-sanitised Current/New previews and applies the raw strings', async () => {
		mockBlocks = formattedBlocks;
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );

		const { container } = render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 0,
							current_text: currentFragment,
							current_text_html: currentFragment,
							suggested_text: replacementFragment,
							suggested_text_html: replacementFragment,
							rationale: 'Confirm the <date> placeholder.',
							supported_by_reviewers: [],
						},
					],
				} ) }
			/>
		);

		const del = container.querySelector( '.jetpack-ai-feedback-list__diff-row.is-current del' );
		const ins = container.querySelector( '.jetpack-ai-feedback-list__diff-row.is-new ins' );
		expect( del?.querySelector( 'strong em' ) ).toHaveTextContent( 'Consultation' );
		expect( del?.querySelectorAll( 'em' )[ 1 ] ).toHaveTextContent( 'opens' );
		expect( del?.querySelector( 's' ) ).toHaveTextContent( 'not this week' );
		expect( del?.querySelector( 'sup' ) ).toHaveTextContent( '2' );
		expect( ins?.querySelector( 'strong em' ) ).toHaveTextContent( 'Consultation' );
		expect( ins?.querySelectorAll( 'em' )[ 1 ] ).toHaveTextContent( 'opens' );
		expect( ins?.querySelector( 's' ) ).toHaveTextContent( 'not this week' );
		expect( ins?.querySelector( 'sup' ) ).toHaveTextContent( '2' );
		expect( del ).toHaveTextContent( 'Consultation openss on next week, not this week, ref2' );
		expect( ins ).toHaveTextContent( 'Consultation opens on next week, not this week, ref2' );
		// Prose rationale keeps literal tags.
		expect( screen.getByText( 'Confirm the <date> placeholder.' ) ).toBeInTheDocument();

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Apply change' } ) );
		} );

		// Apply receives the exact raw strings rather than either display preview.
		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'f0',
			replacementFragment,
			undefined,
			currentFragment,
			expect.any( Function ),
			undefined
		);
	} );

	it( 'formats manual Current and Suggestion content without using the apply flag', () => {
		mockBlocks = formattedBlocks;
		const { container } = render(
			<AiEditorialReview
				{ ...basePayload( {
					suggested_edits: [
						{
							block_index: 0,
							current_text: currentFragment,
							current_text_html: currentFragment,
							suggested_text: 'Rewrite the intro; keep <em>emphasis</em>.',
							suggested_text_html: 'Rewrite the intro; keep <em>emphasis</em>.',
							rationale: 'Needs author judgment.',
							supported_by_reviewers: [],
							requires_manual: true,
						},
					],
				} ) }
			/>
		);

		expect( container.querySelector( 'del strong em' ) ).toHaveTextContent( 'Consultation' );
		expect( container.querySelector( 'ins em' ) ).toHaveTextContent( 'emphasis' );
		expect( container.querySelector( 'ins' ) ).toHaveTextContent(
			'Rewrite the intro; keep emphasis.'
		);
		expect( screen.queryByRole( 'button', { name: 'Apply change' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the server-sanitised conflict preview without changing the apply value', async () => {
		mockBlocks = formattedBlocks;
		mockApplyReviewEdit.mockResolvedValueOnce( { success: true } );
		const candidateFragment = `${ replacementFragment }<iframe></iframe><a href="javascript:window.pwned = true">unsafe link</a>`;
		const candidatePreview = `${ replacementFragment }<a>unsafe link</a>`;
		render(
			<AiEditorialReview
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Framing',
							positions: [ { reviewer: 'Marcus', position: 'Softer.' } ],
							guideline_anchor: null,
							recommended_resolution: 'Use the softer wording.',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI resolution',
									block_index: 0,
									current_text: currentFragment,
									text: candidateFragment,
									text_html: candidatePreview,
									rationale: 'Grounded.',
								},
							],
						},
					],
				} ) }
			/>
		);

		const aiText = document.querySelector( '.jetpack-ai-editorial-review__ai-text' );
		expect( aiText?.tagName ).toBe( 'DIV' );
		expect( aiText ).not.toHaveAttribute( 'role' );
		expect( document.querySelector( 'p > div' ) ).not.toBeInTheDocument();
		expect( aiText?.querySelector( 'strong em' ) ).toHaveTextContent( 'Consultation' );
		expect( aiText?.querySelectorAll( 'em' )[ 1 ] ).toHaveTextContent( 'opens' );
		expect( aiText?.querySelector( 's' ) ).toHaveTextContent( 'not this week' );
		expect( aiText?.querySelector( 'sup' ) ).toHaveTextContent( '2' );
		expect( aiText?.querySelector( 'iframe' ) ).toBeNull();
		expect( aiText?.querySelector( 'a' ) ).not.toHaveAttribute( 'href' );

		await act( async () => {
			fireEvent.click( screen.getByRole( 'button', { name: 'Accept AI resolution' } ) );
		} );

		expect( mockApplyReviewEdit ).toHaveBeenCalledWith(
			'f0',
			candidateFragment,
			undefined,
			currentFragment,
			expect.any( Function ),
			undefined
		);
	} );

	it( 'renders an HTML-like candidate literally when the server preview is absent', () => {
		mockBlocks = formattedBlocks;
		render(
			<AiEditorialReview
				{ ...basePayload( {
					conflicts: [
						{
							subject: 'Framing',
							positions: [ { reviewer: 'Marcus', position: 'Softer.' } ],
							guideline_anchor: null,
							recommended_resolution: 'Use the softer wording.',
							candidate_resolutions: [
								{
									source: 'ai',
									reviewer_name: null,
									label: 'AI resolution',
									block_index: 0,
									current_text: currentFragment,
									text: '<strong>Use this wording.</strong>',
									rationale: 'Grounded.',
								},
							],
						},
					],
				} ) }
			/>
		);

		const aiText = document.querySelector( '.jetpack-ai-editorial-review__ai-text' );
		expect( aiText?.tagName ).toBe( 'P' );
		expect( aiText?.querySelector( 'strong' ) ).toBeNull();
		expect( aiText ).toHaveTextContent( '<strong>Use this wording.</strong>' );
	} );
} );
