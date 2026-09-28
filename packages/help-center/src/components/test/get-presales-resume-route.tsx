import { getPresalesResumeRoute } from '../get-presales-resume-route';

const chat = {
	odieId: 123,
	sessionId: 'abc-def',
	botSlug: 'wpcom-workflow-chat_loggedout',
};

describe( 'getPresalesResumeRoute', () => {
	it( 'rewrites a bare /odie open of the presales launcher to the saved conversation', () => {
		expect( getPresalesResumeRoute( '/odie', 'plans-presales', chat ) ).toBe(
			'/odie?chatId=123&sessionId=abc-def&botSlug=wpcom-workflow-chat_loggedout'
		);
	} );

	it( 'leaves a bare /odie alone when there is no saved conversation', () => {
		expect( getPresalesResumeRoute( '/odie', 'plans-presales', undefined ) ).toBe( '/odie' );
	} );

	it( 'leaves a bare /odie alone outside the presales launcher', () => {
		expect( getPresalesResumeRoute( '/odie', undefined, chat ) ).toBe( '/odie' );
	} );

	it( 'never rewrites a route that already carries params', () => {
		expect( getPresalesResumeRoute( '/odie?provider=zendesk', 'plans-presales', chat ) ).toBe(
			'/odie?provider=zendesk'
		);
	} );
} );
