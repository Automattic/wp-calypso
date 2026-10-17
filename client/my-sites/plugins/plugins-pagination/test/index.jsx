/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderToString } from 'react-dom/server';
import PluginsPagination, { getPluginsPageUrl } from '../';

const props = {
	path: '/es/plugins/browse/seo?s=contact+form&source=test&page=2#results',
	page: 2,
	pages: 4,
	isEmpty: false,
};

test( 'renders crawlable links and preserves locale, search, other parameters and hash', () => {
	render( <PluginsPagination { ...props } /> );
	expect( screen.getByRole( 'navigation', { name: 'Plugin result pages' } ) ).toBeVisible();
	expect( screen.getByText( 'Page 2 of 4' ) ).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Previous' } ) ).toHaveAttribute(
		'href',
		'/es/plugins/browse/seo?s=contact+form&source=test#results'
	);
	expect( screen.getByRole( 'link', { name: 'Next' } ) ).toHaveAttribute(
		'href',
		'/es/plugins/browse/seo?s=contact+form&source=test&page=3#results'
	);
} );

test( 'omits Previous on page 1 and Next on the last reachable page', () => {
	const { rerender } = render( <PluginsPagination { ...props } page={ 1 } pages={ 11 } /> );
	expect( screen.queryByRole( 'link', { name: 'Previous' } ) ).toBeNull();
	rerender( <PluginsPagination { ...props } page={ 11 } pages={ 11 } /> );
	expect( screen.getByText( 'Page 11 of 11' ) ).toBeVisible();
	expect( screen.queryByRole( 'link', { name: 'Next' } ) ).toBeNull();
	expect( screen.getByRole( 'link', { name: 'Previous' } ) ).toHaveAttribute( 'rel', 'prev' );
} );

test( 'hides navigation while loading', () => {
	const { container } = render( <PluginsPagination { ...props } isFetching /> );
	expect( container ).toBeEmptyDOMElement();
} );

test( 'offers a first-page link for an empty page', () => {
	render( <PluginsPagination { ...props } isEmpty /> );
	expect( screen.getByText( 'No plugins found on this page.' ) ).toBeVisible();
	expect( screen.getByRole( 'link', { name: 'Go to the first page' } ) ).toHaveAttribute(
		'href',
		getPluginsPageUrl( props.path, 1 )
	);
	expect( screen.queryByRole( 'navigation' ) ).toBeNull();
} );

test( 'offers retry for failures and supports keyboard activation', async () => {
	const retry = jest.fn();
	const user = userEvent.setup();
	render( <PluginsPagination { ...props } isError retry={ retry } /> );
	expect( screen.getByRole( 'alert' ) ).toHaveTextContent( 'Unable to load plugins' );
	await user.tab();
	expect( screen.getByRole( 'button', { name: 'Retry' } ) ).toHaveFocus();
	await user.keyboard( '{Enter}' );
	expect( retry ).toHaveBeenCalledTimes( 1 );
} );

test( 'includes links in server-rendered HTML', () => {
	const html = renderToString( <PluginsPagination { ...props } /> );
	expect( html ).toContain(
		'href="/es/plugins/browse/seo?s=contact+form&amp;source=test&amp;page=3#results"'
	);
	expect( html ).toContain( 'rel="next"' );
} );
