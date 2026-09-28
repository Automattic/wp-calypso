/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../test-utils';
import VipSection from '../vip-section';

const DEMO_URL =
	'https://wpvip.com/get-a-demo/?utm_source=partner&utm_medium=referral&utm_campaign=a4a';
const REFER_PATH = '/marketplace/hosting/refer-enterprise-hosting';

// As in classic, the VIP capabilities card repeats the pitch line, so look at the card header only.
function pitchCardHeader() {
	return screen.getByRole( 'heading', { name: /Deliver unmatched performance/ } ).parentElement;
}

describe( '<VipSection>', () => {
	test( 'leads with the demo button and the classic pitch', () => {
		render( <VipSection isReferralMode={ false } /> );

		const buttons = screen.getAllByRole( 'link', { name: /Request a demo|Refer your client/ } );
		expect( buttons[ 0 ] ).toHaveTextContent( 'Request a demo' );
		expect( buttons[ 0 ] ).toHaveClass( 'is-primary' );
		expect( buttons[ 0 ] ).toHaveAttribute( 'href', DEMO_URL );
		expect( buttons[ 0 ] ).toHaveAttribute( 'target', '_blank' );
		expect( buttons[ 1 ] ).toHaveTextContent( 'Refer your client to VIP hosting' );
		expect( buttons[ 1 ] ).toHaveClass( 'is-secondary' );
		expect( buttons[ 1 ].getAttribute( 'href' ) ).toContain( REFER_PATH );

		expect( pitchCardHeader() ).toHaveTextContent(
			'Combine the ease of WordPress with enterprise-grade security and scalability.'
		);
	} );

	test( 'leads with the referral button and the commission pitch in referral mode', () => {
		render( <VipSection isReferralMode /> );

		const buttons = screen.getAllByRole( 'link', { name: /Request a demo|Refer your client/ } );
		expect( buttons[ 0 ] ).toHaveTextContent( 'Refer your client to VIP hosting' );
		expect( buttons[ 0 ] ).toHaveClass( 'is-primary' );
		expect( buttons[ 1 ] ).toHaveTextContent( 'Request a demo' );
		expect( buttons[ 1 ] ).toHaveClass( 'is-secondary' );

		expect( pitchCardHeader() ).toHaveTextContent(
			'Successfully refer your client to WordPress VIP and you’ll earn up to a 20% one-time commission'
		);
	} );

	test( 'records a tracks event for each button', async () => {
		const { recordTracksEvent } = render( <VipSection isReferralMode={ false } /> );

		await userEvent.click( screen.getByRole( 'link', { name: /Request a demo/ } ) );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_enterprise_request_demo_click'
		);

		await userEvent.click(
			screen.getByRole( 'link', { name: 'Refer your client to VIP hosting' } )
		);
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_a4a_marketplace_hosting_enterprise_refer_client_click'
		);
	} );
} );
