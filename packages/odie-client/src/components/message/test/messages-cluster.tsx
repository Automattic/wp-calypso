import { render, screen } from '@testing-library/react';
import { MessagesClusterizer } from '../messages-cluster/messages-cluster';
import type { Message } from '../../../types';

jest.mock( '../../../utils', () => ( {
	isCSATMessage: ( message: Message ) => message?.metadata?.type === 'csat',
} ) );

jest.mock( '../../../utils/csat', () => ( {
	hasFeedbackForm: () => false,
	isAttachment: () => false,
	isHappinessEngineerMessage: ( message: Message ) =>
		!! message?.metadata?.[ '__zendesk_msg.agent.id' ],
	isZendeskChatStartedMessage: () => false,
	isZendeskIntroMessage: () => false,
} ) );

// Tracks every mount of the mocked ChatMessage below, so tests can assert a re-render did (or
// didn't) force React to remount a message -- which is exactly the failure mode of DOTCOM-18205:
// an unstable message-cluster key wiped CSATForm's local rating state on every unrelated re-render.
const mockMountSpy = jest.fn();

jest.mock( '..', () => ( {
	__esModule: true,
	default: ( { message, header }: { message: Message; header?: React.ReactNode } ) => {
		// eslint-disable-next-line react-hooks/rules-of-hooks
		jest.requireActual( 'react' ).useEffect( () => {
			mockMountSpy( message.content );
		}, [] );

		return (
			<div>
				{ header }
				<div>{ message.content }</div>
			</div>
		);
	},
} ) );

jest.mock( '../../chat-with-support', () => () => null );

const createBusinessMessage = ( {
	content,
	displayName,
	received,
	agentId,
}: {
	content: string;
	displayName: string;
	received: number;
	agentId?: string;
} ): Message => ( {
	content,
	displayName,
	received,
	role: 'business',
	type: 'message',
	metadata: agentId ? { '__zendesk_msg.agent.id': agentId } : {},
} );

const createCSATMessage = ( {
	content,
	received,
}: {
	content: string;
	received: number;
} ): Message => ( {
	content,
	received,
	role: 'business',
	type: 'message',
	metadata: { type: 'csat' },
} );

describe( 'MessagesClusterizer', () => {
	beforeEach( () => {
		let nextId = 0;
		jest
			.spyOn( crypto, 'randomUUID' )
			.mockImplementation(
				() => `00000000-0000-0000-0000-${ String( ++nextId ).padStart( 12, '0' ) }`
			);
	} );

	afterEach( () => {
		jest.restoreAllMocks();
		mockMountSpy.mockClear();
	} );

	it( 'splits automated business message groups when the display name changes', () => {
		render(
			<MessagesClusterizer
				messages={ [
					createBusinessMessage( {
						content: 'First automated message',
						displayName: 'WordPress.com',
						received: 1,
					} ),
					createBusinessMessage( {
						content: 'Second automated message',
						displayName: 'Jetpack',
						received: 2,
					} ),
				] }
			/>
		);

		expect( screen.getByText( 'WordPress.com' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Jetpack' ) ).toBeInTheDocument();
	} );

	it( 'renders only the most recent CSAT prompt when Zendesk sends more than one', () => {
		render(
			<MessagesClusterizer
				messages={ [
					createCSATMessage( { content: 'First CSAT prompt', received: 1 } ),
					createCSATMessage( { content: 'Second CSAT prompt', received: 2 } ),
				] }
			/>
		);

		expect( screen.queryByText( 'First CSAT prompt' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Second CSAT prompt' ) ).toBeInTheDocument();
	} );

	it( 'keeps non-CSAT messages sent after a CSAT prompt', () => {
		render(
			<MessagesClusterizer
				messages={ [
					createCSATMessage( { content: 'CSAT prompt', received: 1 } ),
					createBusinessMessage( {
						content: 'Follow-up message',
						displayName: 'WordPress.com',
						received: 2,
					} ),
				] }
			/>
		);

		expect( screen.getByText( 'CSAT prompt' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Follow-up message' ) ).toBeInTheDocument();
	} );

	it( 'does not remount a message when re-rendered with an equivalent (but new) messages array', () => {
		// A fresh array reference each time, as happens when a parent re-renders in response to an
		// unrelated Zendesk conversation event -- e.g. after submitting a CSAT comment. Regression
		// test for DOTCOM-18205: an unstable crypto.randomUUID() group key was force-remounting the
		// whole message cluster (and resetting CSATForm's local rating state) on every such re-render.
		const buildMessages = (): Message[] => [
			createCSATMessage( { content: 'CSAT prompt', received: 1 } ),
		];

		const { rerender } = render( <MessagesClusterizer messages={ buildMessages() } /> );
		expect( mockMountSpy ).toHaveBeenCalledTimes( 1 );

		rerender( <MessagesClusterizer messages={ buildMessages() } /> );

		expect( mockMountSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'remounts a message when a genuinely new message is appended', () => {
		const first = [ createCSATMessage( { content: 'CSAT prompt', received: 1 } ) ];
		const { rerender } = render( <MessagesClusterizer messages={ first } /> );
		expect( mockMountSpy ).toHaveBeenCalledTimes( 1 );

		rerender(
			<MessagesClusterizer
				messages={ [
					...first,
					createBusinessMessage( {
						content: 'Follow-up message',
						displayName: 'WordPress.com',
						received: 2,
					} ),
				] }
			/>
		);

		expect( mockMountSpy ).toHaveBeenCalledTimes( 2 );
		expect( mockMountSpy ).toHaveBeenNthCalledWith( 2, 'Follow-up message' );
	} );
} );
