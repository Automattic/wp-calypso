/**
 * @jest-environment jsdom
 * @jest-environment-options { "url": "https://my.localhost/" }
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Notice from '../../components/notice';
import { render } from '../../test-utils';
import { SitesNoticeArbiter } from '../notice-arbiter';

describe( '<SitesNoticeArbiter>', () => {
	test( 'renders only the first page candidate when several are eligible', async () => {
		render(
			<SitesNoticeArbiter>
				<Notice>First notice</Notice>
				<Notice>Second notice</Notice>
			</SitesNoticeArbiter>
		);

		expect( await screen.findByText( 'First notice' ) ).toBeVisible();
		expect( screen.queryByText( 'Second notice' ) ).not.toBeInTheDocument();
	} );

	test( 'skips ineligible page candidates', async () => {
		const isEligible: boolean = false;

		render(
			<SitesNoticeArbiter>
				{ isEligible && <Notice>Ineligible notice</Notice> }
				<Notice>Eligible notice</Notice>
			</SitesNoticeArbiter>
		);

		expect( await screen.findByText( 'Eligible notice' ) ).toBeVisible();
	} );

	test( 'renders nothing when no candidate is eligible', async () => {
		const isEligible: boolean = false;

		render(
			<div>
				<span>Page content</span>
				<SitesNoticeArbiter>
					{ isEligible && <Notice>Ineligible notice</Notice> }
				</SitesNoticeArbiter>
			</div>
		);

		expect( await screen.findByText( 'Page content' ) ).toBeVisible();
		expect( screen.queryByText( 'Ineligible notice' ) ).not.toBeInTheDocument();
	} );

	test( 'does not promote a lower-priority candidate when a dismissed notice self-nulls', async () => {
		// The sanctioned dismissal pattern: the component stays mounted and
		// renders null after an in-session dismissal.
		function DismissibleNotice() {
			const [ isDismissed, setIsDismissed ] = useState( false );
			if ( isDismissed ) {
				return null;
			}
			return <Notice onClose={ () => setIsDismissed( true ) }>High priority notice</Notice>;
		}

		render(
			<SitesNoticeArbiter>
				<DismissibleNotice />
				<Notice>Low priority notice</Notice>
			</SitesNoticeArbiter>
		);

		expect( await screen.findByText( 'High priority notice' ) ).toBeVisible();
		expect( screen.queryByText( 'Low priority notice' ) ).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: /dismiss/i } ) );

		expect( screen.queryByText( 'High priority notice' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Low priority notice' ) ).not.toBeInTheDocument();
	} );
} );
