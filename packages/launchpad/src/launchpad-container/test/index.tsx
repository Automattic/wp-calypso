import { render } from '@testing-library/react';
import React from 'react';
import LaunchpadContainer from '../';

describe( 'LaunchpadContainer', () => {
	it( 'renders the container with sidebar and content', () => {
		const { getByText } = render(
			<LaunchpadContainer sidebar={ <div>Sidebar</div> }>My Content</LaunchpadContainer>
		);

		expect( getByText( 'Sidebar' ) ).toBeInTheDocument();
		expect( getByText( 'My Content' ) ).toBeInTheDocument();
	} );

	it( 'renders the container with header', () => {
		const { getByText } = render(
			<LaunchpadContainer sidebar={ <div>Sidebar</div> } header={ <div>Header</div> }>
				My Content
			</LaunchpadContainer>
		);

		expect( getByText( 'Header' ) ).toBeInTheDocument();
	} );

	it( 'renders the container without header', () => {
		const { container } = render(
			<LaunchpadContainer sidebar={ <div>Sidebar</div> }>My Content</LaunchpadContainer>
		);

		expect( container.querySelector( '.launchpad-container__header' ) ).not.toBeInTheDocument();
	} );

	it( 'renders the container with custom classes', () => {
		const { container } = render(
			<LaunchpadContainer
				className="classname"
				headerClassName="header-classname"
				contentClassName="content-classname"
				sidebarClassName="sidebar-classname"
				mainContentClassName="main-content-classname"
				sidebar={ <div>Sidebar</div> }
				header={ <div>Header</div> }
			>
				My Content
			</LaunchpadContainer>
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
				.querySelector( '.launchpad-container__content' )
				?.classList.contains( 'content-classname' )
		).toBeTruthy();
		expect(
			container
				.querySelector( '.launchpad-container__sidebar' )
				?.classList.contains( 'sidebar-classname' )
		).toBeTruthy();
		expect(
			container
				.querySelector( '.launchpad-container__main-content' )
				?.classList.contains( 'main-content-classname' )
		).toBeTruthy();
	} );
} );
