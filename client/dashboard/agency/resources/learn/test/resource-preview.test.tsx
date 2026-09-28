/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResourcePreview from '../resource-preview';
import type { LibraryResource } from '../types';

jest.mock( '../sample-documents', () => ( {
	sampleDocuments: {
		guide: { url: '/guide.pdf', pages: [ '/guide-page.png' ] },
	},
} ) );
jest.mock( '../resource-product-logo', () => () => null );

const defaultMediaQuery = window.matchMedia( '' );
beforeEach( () => {
	jest.spyOn( window, 'matchMedia' ).mockImplementation( ( query ) => ( {
		...defaultMediaQuery,
		media: query,
		matches: query === '(prefers-reduced-motion: reduce)',
	} ) );
} );
afterEach( () => jest.restoreAllMocks() );

const guide: LibraryResource = {
	id: 'guide',
	title: 'A practical guide',
	description: 'A guide available in different formats.',
	product: 'Pressable',
	stage: 'Learn',
	audience: 'All audiences',
	contentType: 'Guide',
	format: 'PDF',
	url: '',
};

test( 'a Guide changes its preview and action with its format, while keeping its content-type tag', async () => {
	const onFilter = jest.fn();
	const props = { origin: null, onClose: jest.fn(), onFilter };
	const { rerender } = render( <ResourcePreview { ...props } resource={ guide } /> );
	expect( screen.getByRole( 'link', { name: 'Download' } ) ).toHaveAttribute(
		'href',
		'/guide.pdf'
	);
	expect( screen.getByRole( 'img', { name: 'A practical guide, 1' } ) ).toBeVisible();

	rerender(
		<ResourcePreview
			{ ...props }
			resource={ { ...guide, format: 'Webpage', url: 'https://example.com/guide' } }
		/>
	);
	expect( screen.getByTitle( guide.title ) ).toHaveAttribute( 'src', 'https://example.com/guide' );
	expect( screen.getByRole( 'link', { name: 'Open in new tab' } ) ).toHaveAttribute(
		'target',
		'_blank'
	);
	expect( screen.queryByRole( 'link', { name: 'Download' } ) ).toBeNull();
	expect( screen.queryByRole( 'img', { name: 'A practical guide, 1' } ) ).toBeNull();
	await userEvent.click( screen.getByRole( 'button', { name: 'Filter by Guide' } ) );
	expect( onFilter ).toHaveBeenCalledWith( 'contentType', 'Guide' );

	rerender(
		<ResourcePreview { ...props } resource={ { ...guide, format: 'Video', url: '/guide.mp4' } } />
	);
	expect( screen.getByLabelText( guide.title, { selector: 'video' } ) ).toHaveAttribute(
		'src',
		'/guide.mp4'
	);
	expect( screen.getByRole( 'link', { name: 'Download' } ) ).toHaveAttribute(
		'href',
		'/guide.mp4'
	);
	expect( screen.queryByTitle( guide.title ) ).toBeNull();
	expect( screen.getByRole( 'button', { name: 'Filter by Guide' } ) ).toBeVisible();
} );

test( 'only offers navigation to resources that exist', async () => {
	const props = { origin: null, resource: guide, onClose: jest.fn(), onFilter: jest.fn() };
	const onNext = jest.fn();
	const onPrevious = jest.fn();
	const { rerender } = render( <ResourcePreview { ...props } /> );
	expect( screen.queryByRole( 'button', { name: 'Previous resource' } ) ).toBeNull();
	expect( screen.queryByRole( 'button', { name: 'Next resource' } ) ).toBeNull();

	rerender( <ResourcePreview { ...props } nextResource={ guide } onNext={ onNext } /> );
	expect( screen.queryByRole( 'button', { name: 'Previous resource' } ) ).toBeNull();
	await userEvent.click( screen.getByRole( 'button', { name: 'Next resource' } ) );
	expect( onNext ).toHaveBeenCalledTimes( 1 );

	rerender( <ResourcePreview { ...props } previousResource={ guide } onPrevious={ onPrevious } /> );
	expect( screen.queryByRole( 'button', { name: 'Next resource' } ) ).toBeNull();
	await userEvent.click( screen.getByRole( 'button', { name: 'Previous resource' } ) );
	expect( onPrevious ).toHaveBeenCalledTimes( 1 );
} );
