import { fireEvent, render, screen } from '@testing-library/react';
import { VideoFeedbackButtons } from './index';

const mockTrack = jest.fn();

jest.mock( '../../../utils/tracking', () => ( {
	trackImageStudioImageFeedback: ( ...args: unknown[] ) => mockTrack( ...args ),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

interface MessageActionAction {
	id: string;
	label: string;
	onClick: () => void;
	disabled?: boolean;
	pressed?: boolean;
}

jest.mock( '@automattic/agenttic-ui', () => ( {
	MessageActions: ( { message }: { message: { actions: MessageActionAction[] } } ) => (
		<div data-testid="message-actions">
			{ message.actions.map( ( action ) => (
				<button
					key={ action.id }
					aria-label={ action.label }
					aria-pressed={ action.pressed ? 'true' : 'false' }
					disabled={ action.disabled }
					onClick={ action.onClick }
				>
					{ action.id }
				</button>
			) ) }
		</div>
	),
	ThumbsUpIcon: () => <span>up-icon</span>,
	ThumbsDownIcon: () => <span>down-icon</span>,
} ) );

jest.mock(
	'@automattic/agents-manager',
	() => ( {
		FeedbackInput: ( {
			onSubmit,
			onCancel,
		}: {
			onSubmit: ( text: string ) => Promise< void >;
			onCancel: () => void;
		} ) => (
			<div data-testid="feedback-input">
				<button onClick={ () => onSubmit( 'bad clip' ) }>submit</button>
				<button onClick={ onCancel }>cancel</button>
			</div>
		),
	} ),
	{ virtual: true }
);

jest.mock( '@wordpress/components', () => ( {
	Popover: ( { children }: { children: React.ReactNode } ) => (
		<div data-testid="popover">{ children }</div>
	),
} ) );

describe( '<VideoFeedbackButtons />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders thumbs up + down', () => {
		render( <VideoFeedbackButtons videoUrl="https://example.com/v.mp4" /> );
		expect( screen.getByRole( 'button', { name: /Good response/i } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Bad response/i } ) ).toBeInTheDocument();
	} );

	it( 'invokes onFeedback("up") and tracks on thumbs up', () => {
		const onFeedback = jest.fn();
		render(
			<VideoFeedbackButtons videoUrl="https://example.com/v.mp4" onFeedback={ onFeedback } />
		);
		fireEvent.click( screen.getByRole( 'button', { name: /Good response/i } ) );
		expect( onFeedback ).toHaveBeenCalledWith( 'up' );
		expect( mockTrack ).toHaveBeenCalledWith(
			expect.objectContaining( { feedback: 'up', attachmentId: null } )
		);
	} );

	it( 'opens feedback popover on thumbs down when onSubmitFeedbackText is provided', () => {
		render(
			<VideoFeedbackButtons
				videoUrl="https://example.com/v.mp4"
				onSubmitFeedbackText={ jest.fn().mockResolvedValue( undefined ) }
			/>
		);
		expect( screen.queryByTestId( 'feedback-input' ) ).not.toBeInTheDocument();
		fireEvent.click( screen.getByRole( 'button', { name: /Bad response/i } ) );
		expect( screen.getByTestId( 'feedback-input' ) ).toBeInTheDocument();
	} );

	it( 'does not open popover on thumbs down without onSubmitFeedbackText', () => {
		render( <VideoFeedbackButtons videoUrl="https://example.com/v.mp4" /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Bad response/i } ) );
		expect( screen.queryByTestId( 'feedback-input' ) ).not.toBeInTheDocument();
	} );

	it( 'locks feedback after first click — opposite button is disabled', () => {
		render( <VideoFeedbackButtons videoUrl="https://example.com/v.mp4" /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Good response/i } ) );
		expect( screen.getByRole( 'button', { name: /Good response/i } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		expect( screen.getByRole( 'button', { name: /Bad response/i } ) ).toBeDisabled();
	} );

	it( 'resets feedback state when videoUrl changes', () => {
		const { rerender } = render( <VideoFeedbackButtons videoUrl="https://example.com/a.mp4" /> );
		fireEvent.click( screen.getByRole( 'button', { name: /Good response/i } ) );
		expect( screen.getByRole( 'button', { name: /Good response/i } ) ).toHaveAttribute(
			'aria-pressed',
			'true'
		);

		rerender( <VideoFeedbackButtons videoUrl="https://example.com/b.mp4" /> );
		expect( screen.getByRole( 'button', { name: /Good response/i } ) ).toHaveAttribute(
			'aria-pressed',
			'false'
		);
		expect( screen.getByRole( 'button', { name: /Bad response/i } ) ).not.toBeDisabled();
	} );

	it( 'submits free-text feedback through onSubmitFeedbackText', async () => {
		const onSubmitFeedbackText = jest.fn().mockResolvedValue( undefined );
		render(
			<VideoFeedbackButtons
				videoUrl="https://example.com/v.mp4"
				onSubmitFeedbackText={ onSubmitFeedbackText }
			/>
		);
		fireEvent.click( screen.getByRole( 'button', { name: /Bad response/i } ) );
		fireEvent.click( screen.getByRole( 'button', { name: /^submit$/i } ) );
		expect( onSubmitFeedbackText ).toHaveBeenCalledWith( 'bad clip' );
	} );
} );
