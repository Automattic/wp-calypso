import { render } from '@testing-library/react';
import React from 'react';
import Container from '../';

describe( 'Checklist', () => {
	it( 'renders the container with sidebar and content', () => {
		const { getByText } = render(
			<Container sidebar={ <div>Sidebar</div> }>My Content</Container>
		);

		expect( getByText( 'Sidebar' ) ).toBeInTheDocument();
		expect( getByText( 'My Content' ) ).toBeInTheDocument();
	} );

	it( 'renders the container with header', () => {
		const { getByText } = render(
			<Container sidebar={ <div>Sidebar</div> } header={ <div>Header</div> }>
				My Content
			</Container>
		);

		expect( getByText( 'Header' ) ).toBeInTheDocument();
	} );

	it( 'renders the container without header', () => {
		const { container } = render(
			<Container sidebar={ <div>Sidebar</div> }>My Content</Container>
		);

		expect( container.querySelector( '.launchpad-container__header' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the container with custom classes', () => {
		const { container } = render(
			<Container
				className="classname"
				headerClassName="header-classname"
				sidebarClassName="sidebar-classname"
				sidebar={ <div>Sidebar</div> }
				header={ <div>Header</div> }
			>
				My Content
			</Container>
		);

		expect(
			container.querySelector( '.launchpad-container' )?.classList.contains( 'classname' )
		).toBeTruthy();
		expect(
			container
				.querySelector( '.launchpad-container__header' )
				?.classList.contains( 'header-classname' )
		).toBeTruthy();
		expect(
			container
				.querySelector( '.launchpad-container__sidebar' )
				?.classList.contains( 'sidebar-classname' )
		).toBeTruthy();
	} );
} );
