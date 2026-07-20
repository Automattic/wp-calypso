/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Suggestion } from '@automattic/agenttic-ui';
import type { ComponentProps, ReactNode, Ref } from 'react';

const mockSetFloatingPosition = jest.fn();
const mockContainerProps = jest.fn();
const mockInputProps = jest.fn();
const mockImageUploaderProps = jest.fn();
const mockHasAiChatEntry = jest.fn();

jest.mock(
	'@automattic/agenttic-ui',
	() => {
		const React = jest.requireActual< typeof import('react') >( 'react' );

		function MockContainer( {
			children,
			emptyView,
			floatingChatState,
			suggestions = [],
			onSuggestionClick,
		}: {
			children: ReactNode;
			emptyView: ReactNode;
			floatingChatState?: string;
			suggestions?: Suggestion[];
			onSuggestionClick?: (
				selectedSuggestion: Suggestion,
				availableSuggestions: Suggestion[]
			) => void;
		} ) {
			mockContainerProps( { floatingChatState } );
			return (
				<div>
					{ emptyView }
					<MockSuggestionButtons suggestions={ suggestions } onSubmit={ onSuggestionClick } />
					{ children }
				</div>
			);
		}

		const MockConversationView = React.forwardRef(
			( { children }: { children: ReactNode }, ref: Ref< HTMLDivElement > ) => (
				<div ref={ ref }>{ children }</div>
			)
		);
		MockConversationView.displayName = 'MockConversationView';

		function MockFooter( { children }: { children: ReactNode } ) {
			return <div>{ children }</div>;
		}

		function MockSuggestionButtons( {
			suggestions = [],
			onSubmit,
		}: {
			suggestions?: Suggestion[];
			onSubmit?: ( selectedSuggestion: Suggestion, availableSuggestions: Suggestion[] ) => void;
		} ) {
			return (
				<div>
					{ suggestions.flatMap( ( suggestion ) => {
						const { options, ...suggestionWithoutOptions } = suggestion;
						if ( ! options?.length ) {
							return (
								<button
									key={ suggestion.id }
									onClick={ () => onSubmit?.( suggestion, suggestions ) }
								>
									{ suggestion.label }
								</button>
							);
						}

						return options.map( ( option ) => {
							const parentPrompt = suggestion.prompt ?? suggestion.label;
							const separator =
								parentPrompt &&
								option.value &&
								! /\s$/.test( parentPrompt ) &&
								! /^\s/.test( option.value )
									? ' '
									: '';
							const selectedSuggestion = {
								...suggestionWithoutOptions,
								label: `${ suggestion.label } ${ option.label }`,
								prompt: `${ parentPrompt }${ separator }${ option.value }`,
							};

							return (
								<button
									key={ `${ suggestion.id }-${ option.id }` }
									onClick={ () => onSubmit?.( selectedSuggestion, suggestions ) }
								>
									{ suggestion.label }: { option.label }
								</button>
							);
						} );
					} ) }
				</div>
			);
		}

		function MockEmptyView( {
			suggestions = [],
			onSuggestionClick,
		}: {
			suggestions?: Suggestion[];
			onSuggestionClick?: (
				selectedSuggestion: Suggestion,
				availableSuggestions: Suggestion[]
			) => void;
		} ) {
			return <MockSuggestionButtons suggestions={ suggestions } onSubmit={ onSuggestionClick } />;
		}

		function MockSuggestions( {
			suggestions = [],
			onSubmit,
		}: {
			suggestions?: Suggestion[];
			onSubmit?: ( selectedSuggestion: Suggestion, availableSuggestions: Suggestion[] ) => void;
		} ) {
			return <MockSuggestionButtons suggestions={ suggestions } onSubmit={ onSubmit } />;
		}

		function MockMessageRenderer( { children }: { children: ReactNode } ) {
			return <>{ children }</>;
		}

		const MockImageUploader = React.forwardRef( ( props: unknown ) => {
			mockImageUploaderProps( props );
			return null;
		} );
		MockImageUploader.displayName = 'MockImageUploader';

		return {
			AgentUI: {
				Container: MockContainer,
				ConversationView: MockConversationView,
				Messages: () => null,
				Footer: MockFooter,
				Suggestions: () => null,
				Notice: () => null,
				Input: ( props: unknown ) => {
					mockInputProps( props );
					return null;
				},
			},
			createMessageRenderer: () => MockMessageRenderer,
			EmptyView: MockEmptyView,
			Suggestions: MockSuggestions,
			ImageUploader: MockImageUploader,
		};
	},
	{ virtual: true }
);

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setFloatingPosition: mockSetFloatingPosition,
	} ),
	useSelect: ( selectFn: ( select: () => { getAgentsManagerState: () => object } ) => unknown ) =>
		selectFn( () => ( {
			getAgentsManagerState: () => ( { floatingPosition: undefined } ),
		} ) ),
} ) );

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text, isRTL: () => false } ) );
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );
jest.mock( '../../stores', () => ( {
	AGENTS_MANAGER_STORE: 'automattic/agents-manager',
} ) );
jest.mock( '../chat-header', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../context-cards', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../feedback-input', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../icons', () => ( {
	AI: () => null,
} ) );
jest.mock( '../selected-block', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../../utils/is-plugin-compass-agent', () => ( {
	isPluginCompassHost: () => false,
} ) );
jest.mock( '../../utils/is-reader-chat-agent', () => ( {
	isReaderChatHost: () => false,
} ) );
jest.mock( '../../hooks/use-has-ai-chat-entry-button', () => ( {
	__esModule: true,
	default: () => mockHasAiChatEntry(),
} ) );

import AgentChat from '../agent-chat';

function renderAgentChat( props: Partial< ComponentProps< typeof AgentChat > > = {} ) {
	return render(
		<AgentChat
			messages={ [] }
			suggestions={ [] }
			emptyViewSuggestions={ [] }
			error={ null }
			chatHeaderOptions={ [] }
			isProcessing={ false }
			isLoadingConversation={ false }
			isDocked={ false }
			isOpen={ false }
			onSubmit={ jest.fn() }
			onAbort={ jest.fn() }
			onClose={ jest.fn() }
			onExpand={ jest.fn() }
			onSuggestionClick={ jest.fn() }
			{ ...props }
		/>
	);
}

describe( 'AgentChat', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasAiChatEntry.mockReturnValue( false );
		document.body.className = '';
	} );

	const imageUpload = ( isUploadingImages: boolean ) =>
		( {
			pendingImages: [],
			uploadingImages: isUploadingImages ? [ { id: 'p1' } ] : [],
			isUploadingImages,
			handleFilesSelected: jest.fn(),
			handleRemoveImage: jest.fn(),
			uploadImagesToWordPress: jest.fn(),
			abortUpload: jest.fn( () => isUploadingImages ),
		} ) as never;

	it( 'locks the composer, the upload action, and the uploader while images upload', () => {
		renderAgentChat( { isOpen: true, imageUpload: imageUpload( true ) } );

		expect( mockInputProps ).toHaveBeenCalledWith(
			expect.objectContaining( { readOnly: true, imageUploadDisabled: true } )
		);
		expect( mockImageUploaderProps ).toHaveBeenCalledWith(
			expect.objectContaining( { disabled: true } )
		);
	} );

	it( 'unlocks the composer when no upload is in flight', () => {
		renderAgentChat( { isOpen: true, imageUpload: imageUpload( false ) } );

		expect( mockInputProps ).toHaveBeenCalledWith(
			expect.objectContaining( { readOnly: false, imageUploadDisabled: false } )
		);
		expect( mockImageUploaderProps ).toHaveBeenCalledWith(
			expect.objectContaining( { disabled: false } )
		);
	} );

	it( 'forwards empty view suggestion clicks to the shared suggestion handler', async () => {
		const user = userEvent.setup();
		const suggestion = {
			id: 'check-grammar',
			label: 'Check grammar',
			prompt: 'Check the grammar and spelling of this text',
		};
		const onSuggestionClick = jest.fn();

		renderAgentChat( { isOpen: true, emptyViewSuggestions: [ suggestion ], onSuggestionClick } );

		await user.click( screen.getByRole( 'button', { name: 'Check grammar' } ) );

		expect( onSuggestionClick ).toHaveBeenCalledWith( suggestion, [ suggestion ] );
	} );

	it( 'preserves the selected prompt from an inline dropdown suggestion', async () => {
		const user = userEvent.setup();
		const option = {
			id: 'formal',
			label: 'Formal',
			value: 'Change the tone of this text to be more formal',
		};
		const suggestion = {
			id: 'change-tone',
			label: 'Change tone',
			prompt: '',
			options: [ option ],
		};
		const onSuggestionClick = jest.fn();

		renderAgentChat( { isOpen: true, suggestions: [ suggestion ], onSuggestionClick } );

		await user.click( screen.getByRole( 'button', { name: 'Change tone: Formal' } ) );

		expect( onSuggestionClick ).toHaveBeenCalledWith( { ...suggestion, prompt: option.value }, [
			suggestion,
		] );
	} );

	it( 'preserves the selected prompt from an empty-view dropdown suggestion', async () => {
		const user = userEvent.setup();
		document.body.classList.add( 'post-php', 'post-type-post' );
		const option = {
			id: 'seo-description',
			label: 'Description',
			value: 'Generate an SEO meta description for this post',
		};
		const suggestion = {
			id: 'seo-enhancer',
			label: 'SEO Enhancer',
			prompt: '',
			options: [ option ],
		};
		const onSuggestionClick = jest.fn();

		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: [ suggestion ],
			onSuggestionClick,
		} );

		await user.click( screen.getByRole( 'button', { name: 'Optimize SEO: Description' } ) );

		expect( onSuggestionClick ).toHaveBeenCalledWith( { ...suggestion, prompt: option.value }, [
			suggestion,
		] );
	} );

	it( 'expands when open', () => {
		renderAgentChat( { isOpen: true } );

		expect( mockContainerProps ).toHaveBeenLastCalledWith( { floatingChatState: 'expanded' } );
	} );

	it( 'groups only writing suggestions while keeping design suggestions top level', async () => {
		const user = userEvent.setup();
		const designSuggestion = {
			id: 'customize-colors',
			label: 'Customize colors',
			prompt: 'Customize colors',
		};
		const whatElseSuggestion = {
			id: 'what-else-can-i-do',
			label: 'What else can you do?',
			prompt: 'What else can you do?',
		};
		const writingSuggestions = [
			{
				id: 'optimize-title',
				label: 'Optimize Title',
				prompt: 'Optimize the title of this post',
			},
			{
				id: 'generate-excerpt',
				label: 'Generate Excerpt',
				prompt: 'Generate an excerpt',
			},
			{
				id: 'seo-enhancer',
				label: 'SEO Enhancer',
				prompt: 'Optimize this content for search engines',
			},
			{
				id: 'generate-feedback',
				label: 'Simple Review',
				prompt: 'Review this saved content',
			},
			{
				id: 'proofread-content',
				label: 'Proofread',
				prompt: 'Proofread this saved content',
			},
			{
				id: 'mediate-review-notes',
				label: 'Editorial Review',
				prompt: 'Run an editorial review',
			},
		];
		const suggestions = [ designSuggestion, whatElseSuggestion, ...writingSuggestions ];
		const onSuggestionClick = jest.fn();

		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: suggestions,
			groupWritingSuggestions: true,
			onSuggestionClick,
		} );

		const designButton = screen.getByRole( 'button', { name: 'Customize colors' } );
		expect( designButton.closest( '.agents-manager-writing-suggestions' ) ).toBeNull();
		expect( screen.getByText( 'Enhance and review your content.' ) ).toBeInTheDocument();

		const writingToggle = screen.getByRole( 'button', { name: /Writing/ } );
		const whatElseButton = screen.getByRole( 'button', { name: 'What else can you do?' } );
		expect( writingToggle.compareDocumentPosition( whatElseButton ) ).toBe(
			Node.DOCUMENT_POSITION_FOLLOWING
		);
		expect( writingToggle ).toHaveAttribute( 'aria-expanded', 'false' );
		expect( screen.queryByRole( 'button', { name: 'Optimize title' } ) ).toBeNull();

		await user.click( writingToggle );
		expect( writingToggle ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( screen.getByRole( 'button', { name: 'Optimize title' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Generate excerpt' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Optimize SEO' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Simple review' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Editorial review' } ) ).toBeInTheDocument();

		await user.click( screen.getByRole( 'button', { name: 'Optimize title' } ) );
		expect( onSuggestionClick ).toHaveBeenCalledWith( writingSuggestions[ 0 ], suggestions );

		await user.click( writingToggle );
		expect( screen.queryByRole( 'button', { name: 'Proofread' } ) ).toBeNull();
	} );

	it( 'keeps the flat empty view when there are no writing suggestions', () => {
		const suggestion = {
			id: 'customize-colors',
			label: 'Customize colors',
			prompt: 'Customize colors',
		};

		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: [ suggestion ],
			groupWritingSuggestions: true,
		} );

		expect( screen.getByRole( 'button', { name: 'Customize colors' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Writing/ } ) ).toBeNull();
	} );

	it( 'keeps writing suggestions flat when there are no design suggestions', () => {
		const suggestions = [
			{
				id: 'add-new-page',
				label: 'Add new page',
				prompt: 'Add a new page',
			},
			{
				id: 'optimize-title',
				label: 'Optimize Title',
				prompt: 'Optimize the title of this post',
			},
		];

		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: suggestions,
			groupWritingSuggestions: true,
		} );

		expect( screen.getByRole( 'button', { name: 'Add new page' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Optimize title' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Writing/ } ) ).toBeNull();
	} );

	it( 'uses sentence-case writing labels in ungrouped editor views', async () => {
		const user = userEvent.setup();
		document.body.classList.add( 'post-php', 'post-type-post' );
		const suggestion = {
			id: 'optimize-title',
			label: 'Optimize Title',
			prompt: 'Optimize the title of this post',
		};
		const onSuggestionClick = jest.fn();

		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: [ suggestion ],
			groupWritingSuggestions: false,
			onSuggestionClick,
		} );

		await user.click( screen.getByRole( 'button', { name: 'Optimize title' } ) );
		expect( onSuggestionClick ).toHaveBeenCalledWith( suggestion, [ suggestion ] );
	} );

	it( 'keeps provider writing labels in ungrouped non-editor views', () => {
		renderAgentChat( {
			isOpen: true,
			emptyViewSuggestions: [
				{
					id: 'optimize-title',
					label: 'Optimize Title',
					prompt: 'Optimize the title of this post',
				},
			],
			groupWritingSuggestions: false,
		} );

		expect( screen.getByRole( 'button', { name: 'Optimize Title' } ) ).toBeInTheDocument();
	} );

	it( 'collapses to a button when closed without the AI chat entry button', () => {
		renderAgentChat( { isOpen: false } );

		expect( mockContainerProps ).toHaveBeenLastCalledWith( { floatingChatState: 'collapsed' } );
	} );

	it( 'minimizes to the bar when closed with the AI chat entry button present', () => {
		mockHasAiChatEntry.mockReturnValue( true );

		renderAgentChat( { isOpen: false } );

		expect( mockContainerProps ).toHaveBeenLastCalledWith( { floatingChatState: 'minimized' } );
	} );
} );
