/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { site } from '../../../../sites-overview/test/test-utils/constants';
import SMSCounter from '../sms-counter';

describe( 'SMSCounter', () => {
	it( 'renders the component with usage information when monthlyLimit is available', () => {
		render( <SMSCounter settings={ site.monitor_settings } /> );

		const counter = screen.getByText( '10/20 SMS used this month on this site' );
		expect( counter ).toBeInTheDocument();
		expect( counter ).not.toHaveClass( 'notification-settings__sms-counter-limit-reached' );
	} );

	it( 'renders the component with limit reached class when is_over_limit is true', () => {
		render(
			<SMSCounter
				settings={ { ...site.monitor_settings, is_over_limit: true, sms_sent_count: 20 } }
			/>
		);

		const counter = screen.getByText( '20/20 SMS used this month on this site' );
		expect( counter ).toBeInTheDocument();
		expect( counter ).toHaveClass( 'notification-settings__sms-counter-limit-reached' );
	} );

	it( 'does not render the component when sms_monthly_limit is not available', () => {
		render( <SMSCounter settings={ { ...site.monitor_settings, sms_monthly_limit: 0 } } /> );
		const counter = screen.queryByText( '10/20 SMS used this month on this site' );
		expect( counter ).not.toBeInTheDocument();
	} );
} );
