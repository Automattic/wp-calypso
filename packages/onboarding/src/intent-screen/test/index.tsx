/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import IntentScreen from '../';
import { SelectItem } from '../../select-items';
import { SelectItemAlt } from '../../select-items-alt';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
	__esModule: true,
	default: function config( key: string ) {
		return key;
	},
} ) );

afterEach( () => {
	jest.clearAllMocks();
} );

const icon = <svg />;
const onSelect = jest.fn();
const preventWidow = jest.fn();

const intents: SelectItem< string >[] = [
	{
		key: '1',
		title: 'Title',
		icon: icon,
		description: <p>Description</p>,
		value: 'value',
		actionText: 'Action Text',
	},
	{
		key: '2',
		title: 'Title',
		icon: icon,
		description: <p>Description</p>,
		value: 'value',
		actionText: 'Action Text',
	},
];

const intentsAlt: SelectItemAlt< string >[] = [
	{
		show: false,
		key: '1-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: false,
		disableText: 'Disabled text',
	},
	{
		show: true,
		key: '2-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: false,
		disableText: 'Disabled text',
	},
	{
		show: true,
		key: '3-alt',
		description: 'Description Alt',
		actionText: 'Action Text Alt',
		value: 'value-alt',
		disable: true,
		disableText: 'Disabled text',
	},
];

describe( 'IntentScreen', () => {
	describe( 'SelectItem', () => {
		it( 'should render H2 titles', () => {
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			const titles = container.querySelectorAll( '.select-items__item-title' );
			expect( titles ).toHaveLength( 2 );
		} );

		it( 'should render a working button', async () => {
			const user = userEvent.setup();
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			const button = container.querySelector( '.select-items__item-button' );
			expect( button ).not.toBeNull();
			expect( button ).toBeVisible();
			expect( button ).toHaveTextContent( 'Action Text' );

			if ( button ) {
				await user.click( button );
			}

			expect( onSelect ).toHaveBeenCalledTimes( 1 );
			expect( onSelect ).toHaveBeenCalledWith( 'value' );
		} );

		it( 'should render icons', () => {
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			expect( container.querySelectorAll( '.select-items__item svg' ) ).toHaveLength( 2 );
		} );
	} );

	describe( 'SelectItemAlt', () => {
		it( 'should render descriptions', () => {
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			expect( container.querySelectorAll( 'p.select-items-alt__item-description' ) ).toHaveLength(
				2
			);
		} );

		it( 'should render a working button', async () => {
			const user = userEvent.setup();

			render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			const button = screen.getAllByRole( 'button', { name: 'Action Text Alt' } )[ 0 ];

			expect( button ).toBeVisible();

			await user.click( button );

			expect( onSelect ).toHaveBeenCalledTimes( 1 );
			expect( onSelect ).toHaveBeenCalledWith( 'value-alt' );
		} );

		it( 'should be able to be hidden', () => {
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			expect( container.querySelectorAll( '.select-items-alt__item' ) ).toHaveLength( 2 );
		} );

		it( 'should be able to be disabled', () => {
			const { container } = render(
				<IntentScreen
					intents={ intents }
					intentsAlt={ intentsAlt }
					onSelect={ onSelect }
					preventWidows={ preventWidow }
				/>
			);

			const buttons = screen.getAllByRole( 'button', { name: 'Action Text Alt' } );
			const lastButton = buttons[ buttons.length - 1 ];

			expect( lastButton ).toBeDisabled();
			expect( container.querySelector( '.select-items-alt__item-disabled-info' ) ).toBeVisible();
		} );
	} );
} );
