import { ODIE_DEFAULT_BOT_SLUG_LEGACY } from '../../constants';
import { getBotSlug } from '../get-bot-slug';

jest.mock( '../../constants', () => ( {
	ODIE_DEFAULT_BOT_SLUG_LEGACY: 'wpcom-support-chat',
} ) );

const loggedInBotSlug = 'wpcom-workflow-support_chat';
const loggedOutBotSlug = 'wpcom-workflow-chat_loggedout';

describe( 'getBotSlug', () => {
	it( 'keeps an existing interaction on its bot slug', () => {
		const supportInteraction = {
			bot_slug: 'wpcom-workflow-support_chat',
		};

		expect( getBotSlug( supportInteraction, loggedInBotSlug, loggedOutBotSlug, false ) ).toBe(
			supportInteraction.bot_slug
		);
	} );

	it( 'uses the legacy slug for an existing interaction without a bot slug', () => {
		const supportInteraction = {
			bot_slug: '',
		};

		expect( getBotSlug( supportInteraction, loggedInBotSlug, loggedOutBotSlug, false ) ).toBe(
			ODIE_DEFAULT_BOT_SLUG_LEGACY
		);
	} );

	it( 'keeps a resumed logged-out session on the configured logged-out bot slug', () => {
		expect( getBotSlug( undefined, loggedInBotSlug, loggedOutBotSlug, true ) ).toBe(
			loggedOutBotSlug
		);
	} );

	it( 'keeps a resumed logged-out session on its bot slug when an interaction is present', () => {
		const supportInteraction = {
			bot_slug: loggedInBotSlug,
		};

		expect( getBotSlug( supportInteraction, loggedInBotSlug, loggedOutBotSlug, true ) ).toBe(
			loggedOutBotSlug
		);
	} );

	it( 'uses the configured logged-in bot slug for a new logged-in chat', () => {
		expect( getBotSlug( undefined, loggedInBotSlug, loggedOutBotSlug, false ) ).toBe(
			loggedInBotSlug
		);
	} );
} );
