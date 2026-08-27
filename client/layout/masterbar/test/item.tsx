/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import Item from '../item';

const render = ( el: React.ReactElement ) => renderWithProvider( el );

describe( 'MasterbarItem sub-items', () => {
	test( 'an openInNewTab sub-item renders as an external link that opens in a new tab', () => {
		render(
			<Item
				subItems={ [
					[ { label: 'Themes', url: 'https://wordpress.com/themes', openInNewTab: true } ],
				] }
			/>
		);

		const link = screen.getByRole( 'link', { name: /Themes/ } );
		expect( link ).toHaveAttribute( 'target', '_blank' );
		expect( link ).toHaveAttribute( 'href', 'https://wordpress.com/themes' );
		expect( link.getAttribute( 'rel' ) ).toContain( 'noopener' );
	} );

	test( 'a regular sub-item stays in the same tab', () => {
		render( <Item subItems={ [ [ { label: 'Plugins', url: '/plugins/manage/sites' } ] ] } /> );

		expect( screen.getByRole( 'link', { name: 'Plugins' } ) ).not.toHaveAttribute(
			'target',
			'_blank'
		);
	} );

	test( 'an external sub-item fires onClick on click and on keyboard activation', async () => {
		const onClick = jest.fn();
		const user = userEvent.setup();
		render(
			<Item
				subItems={ [
					[ { label: 'Themes', url: 'https://wordpress.com/themes', openInNewTab: true, onClick } ],
				] }
			/>
		);

		const link = screen.getByRole( 'link', { name: /Themes/ } );

		await user.click( link );
		expect( onClick ).toHaveBeenCalledTimes( 1 );

		link.focus();
		await user.keyboard( '{Enter}' );
		expect( onClick ).toHaveBeenCalledTimes( 2 );
	} );
} );
