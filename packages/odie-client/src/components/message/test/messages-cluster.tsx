import { render, screen } from '@testing-library/react';
import { MessagesClusterizer } from '../messages-cluster/messages-cluster';
import type { Message } from '../../../types';

jest.mock( '../../../utils', () => ( {
	isCSATMessage: () => false,
} ) );

jest.mock( '../../../utils/csat', () => ( {
	hasFeedbackForm: () => false,
	isAttachment: () => false,
	isHappinessEngineerMessage: ( message: Message ) =>
		!! message?.metadata?.[ '__zendesk_msg.agent.id' ],
	isZendeskChatStartedMessage: () => false,
	isZendeskIntroMessage: () => false,
} ) );

jest.mock( '..', () => ( {
	__esModule: true,
	default: ( { message, header }: { message: Message; header?: React.ReactNode } ) => (
		<div>
			{ header }
			<div>{ message.content }</div>
		</div>
	),
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
} );
