/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UpsellNoticeActionButton } from '..';
import { render } from '../../../test-utils';

describe( '<UpsellNoticeActionButton>', () => {
	test( 'records the upsell click and runs the click handler', async () => {
		const onClick = jest.fn();
		const { recordTracksEvent } = render(
			<UpsellNoticeActionButton
				variant="solid"
				upsellId="test-upsell"
				upsellFeatureId="test-feature"
				onClick={ onClick }
			>
				Upgrade
			</UpsellNoticeActionButton>
		);

		await userEvent.click( screen.getByRole( 'button', { name: 'Upgrade' } ) );

		expect( recordTracksEvent ).toHaveBeenCalledWith( 'calypso_dashboard_upsell_click', {
			upsell_id: 'test-upsell',
			upsell_feature_id: 'test-feature',
		} );
		expect( onClick ).toHaveBeenCalled();
	} );
} );
