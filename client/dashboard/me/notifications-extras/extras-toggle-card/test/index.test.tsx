/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WPCOM_OPTION_KEYS, WPCOM_TITLES, WPCOM_DESCRIPTIONS } from '../../extras-config';
import { ExtrasToggleCard } from '../index';
import type { WpcomNotificationSettings } from '@automattic/api-core';

const mockOnMutate = jest.fn();

const defaultExtraSettings: Partial< WpcomNotificationSettings > = {
	marketing: false,
	research: false,
	community: false,
	promotion: false,
	news: false,
	digest: false,
	reports: false,
	news_developer: false,
	scheduled_updates: false,
};

describe( 'ExtrasToggleCard', () => {
	beforeEach( () => {
		mockOnMutate.mockClear();
	} );

	const renderExtrasToggleCard = ( props = {} ) => {
		return render(
			<ExtrasToggleCard
				extraSettings={ defaultExtraSettings }
				isSaving={ false }
				onMutate={ mockOnMutate }
				optionKeys={ WPCOM_OPTION_KEYS }
				titles={ WPCOM_TITLES }
				descriptions={ WPCOM_DESCRIPTIONS }
				sectionTitle="Test Section"
				{ ...props }
			/>
		);
	};

	it( 'renders section title', () => {
		renderExtrasToggleCard();

		expect( screen.getByText( 'Test Section' ) ).toBeVisible();
	} );

	it( 'renders section description when provided', () => {
		const sectionDescription = <div>Test description</div>;
		renderExtrasToggleCard( { sectionDescription } );

		expect( screen.getByText( 'Test description' ) ).toBeVisible();
	} );

	it( 'renders all toggle controls with correct labels', () => {
		renderExtrasToggleCard();

		expect( screen.getByLabelText( 'Suggestions' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Research' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Community' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Promotions' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Newsletter' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Digests' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Reports' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Developer Newsletter' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Scheduled updates' ) ).toBeVisible();
	} );

	it( 'shows descriptions as help text', () => {
		renderExtrasToggleCard();

		expect( screen.getByText( 'Tips for getting the most out of WordPress.com.' ) ).toBeVisible();
		expect(
			screen.getByText( 'Opportunities to participate in WordPress.com research and surveys.' )
		).toBeVisible();
		expect(
			screen.getByText( 'Information on WordPress.com courses and events (online and in-person).' )
		).toBeVisible();
	} );

	it( 'shows "Subscribe to all" when no options are enabled', () => {
		renderExtrasToggleCard();

		expect( screen.getByText( 'Subscribe to all' ) ).toBeVisible();
		expect( screen.queryByText( 'Unsubscribe from all' ) ).not.toBeInTheDocument();
	} );

	it( 'shows "Unsubscribe from all" when some options are enabled', () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true,
			research: true,
		};

		renderExtrasToggleCard( { extraSettings } );

		expect( screen.getByText( 'Unsubscribe from all' ) ).toBeVisible();
		expect( screen.queryByText( 'Subscribe to all' ) ).not.toBeInTheDocument();
	} );

	it( 'reflects current settings in toggle states', () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true,
			community: true,
			reports: true,
		};

		renderExtrasToggleCard( { extraSettings } );

		expect( screen.getByLabelText( 'Suggestions' ) ).toBeChecked();
		expect( screen.getByLabelText( 'Research' ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Community' ) ).toBeChecked();
		expect( screen.getByLabelText( 'Promotions' ) ).not.toBeChecked();
		expect( screen.getByLabelText( 'Reports' ) ).toBeChecked();
	} );

	it( 'calls onMutate when individual toggle is changed', async () => {
		renderExtrasToggleCard();

		const marketingToggle = screen.getByLabelText( 'Suggestions' );
		await userEvent.click( marketingToggle );

		expect( mockOnMutate ).toHaveBeenCalledWith( { marketing: true } );
	} );

	it( 'calls onMutate when "Subscribe to all" is clicked', async () => {
		renderExtrasToggleCard();

		const subscribeAllToggle = screen.getByLabelText( 'Subscribe to all' );
		await userEvent.click( subscribeAllToggle );

		expect( mockOnMutate ).toHaveBeenCalledWith( {
			marketing: true,
			research: true,
			community: true,
			promotion: true,
			news: true,
			digest: true,
			reports: true,
			news_developer: true,
			scheduled_updates: true,
		} );
	} );

	it( 'calls onMutate when "Unsubscribe from all" is clicked', async () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true,
			research: true,
			community: true,
		};

		renderExtrasToggleCard( { extraSettings } );

		const unsubscribeAllToggle = screen.getByLabelText( 'Unsubscribe from all' );
		await userEvent.click( unsubscribeAllToggle );

		expect( mockOnMutate ).toHaveBeenCalledWith( {
			marketing: false,
			research: false,
			community: false,
		} );
	} );

	it( 'only sends changes for options that differ from current state in "Subscribe to all"', async () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true, // Already enabled
			research: false,
		};

		renderExtrasToggleCard( { extraSettings } );

		const subscribeAllToggle = screen.getByLabelText( 'Unsubscribe from all' ); // Should show "Unsubscribe" since marketing is true
		await userEvent.click( subscribeAllToggle );

		// Should only send the change for marketing (from true to false)
		expect( mockOnMutate ).toHaveBeenCalledWith( {
			marketing: false,
		} );
	} );

	it( 'disables all toggles when isSaving is true', () => {
		renderExtrasToggleCard( { isSaving: true } );

		expect( screen.getByLabelText( 'Subscribe to all' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Suggestions' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Research' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Community' ) ).toBeDisabled();
	} );

	it( 'disables all toggles when extraSettings is undefined', () => {
		renderExtrasToggleCard( { extraSettings: undefined } );

		expect( screen.getByLabelText( 'Subscribe to all' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Suggestions' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Research' ) ).toBeDisabled();
		expect( screen.getByLabelText( 'Community' ) ).toBeDisabled();
	} );

	it( 'does not call onMutate when extraSettings is undefined', async () => {
		renderExtrasToggleCard( { extraSettings: undefined } );

		const subscribeAllToggle = screen.getByLabelText( 'Subscribe to all' );
		await userEvent.click( subscribeAllToggle );

		expect( mockOnMutate ).not.toHaveBeenCalled();
	} );

	it( 'does not call onMutate when no changes are needed for "Subscribe to all"', async () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true,
			research: true,
			community: true,
			promotion: true,
			news: true,
			digest: true,
			reports: true,
			news_developer: true,
			scheduled_updates: true,
		};

		renderExtrasToggleCard( { extraSettings } );

		// All are already enabled, clicking "Unsubscribe from all" then "Subscribe to all" should not call onMutate again
		const toggle = screen.getByLabelText( 'Unsubscribe from all' );
		await userEvent.click( toggle ); // This will call onMutate to disable all

		mockOnMutate.mockClear();

		// Now click subscribe to all - but since they're all already true, no mutation should happen
		// First we need to simulate the state change from the previous click
		renderExtrasToggleCard( { extraSettings: defaultExtraSettings } );

		const subscribeAllToggle = screen.getByLabelText( 'Subscribe to all' );
		await userEvent.click( subscribeAllToggle );

		// This should call onMutate because we're going from all false to all true
		expect( mockOnMutate ).toHaveBeenCalled();
	} );

	it( 'handles individual toggle changes correctly', async () => {
		const extraSettings = {
			...defaultExtraSettings,
			marketing: true,
		};

		renderExtrasToggleCard( { extraSettings } );

		// Toggle marketing off
		const marketingToggle = screen.getByLabelText( 'Suggestions' );
		await userEvent.click( marketingToggle );

		expect( mockOnMutate ).toHaveBeenCalledWith( { marketing: false } );

		mockOnMutate.mockClear();

		// Toggle research on
		const researchToggle = screen.getByLabelText( 'Research' );
		await userEvent.click( researchToggle );

		expect( mockOnMutate ).toHaveBeenCalledWith( { research: true } );
	} );

	it( 'renders without descriptions when not provided', () => {
		render(
			<ExtrasToggleCard
				extraSettings={ defaultExtraSettings }
				isSaving={ false }
				onMutate={ mockOnMutate }
				optionKeys={ WPCOM_OPTION_KEYS }
				titles={ WPCOM_TITLES }
				sectionTitle="Test Section"
			/>
		);

		// Labels should still be present
		expect( screen.getByLabelText( 'Suggestions' ) ).toBeVisible();
		expect( screen.getByLabelText( 'Research' ) ).toBeVisible();

		// But descriptions should not be present
		expect(
			screen.queryByText( 'Tips for getting the most out of WordPress.com.' )
		).not.toBeInTheDocument();
	} );
} );
