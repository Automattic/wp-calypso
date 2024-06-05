/**
 * @jest-environment jsdom
 */

import pageSpy from '@automattic/calypso-router';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapDomainStep from 'calypso/components/domains/map-domain-step';
import wpcom from 'calypso/lib/wp';
import { domainManagementList } from 'calypso/my-sites/domains/paths';
import productsList from 'calypso/state/products-list/reducer';
import { reducer as ui } from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MapDomain } from '..';

const render = ( el, options ) =>
	renderWithProvider( el, { ...options, reducers: { ui, productsList } } );

jest.mock( '@automattic/calypso-router', () => {
	const pageMock = jest.fn();
	pageMock.redirect = jest.fn();
	return pageMock;
} );

jest.mock( 'calypso/components/domains/map-domain-step', () =>
	jest.fn( () => <div data-testid="map-domain-step" /> )
);

describe( 'MapDomain component', () => {
	const defaultProps = {
		cart: {},
		productsList: {},
		domainsWithPlansOnly: false,
		translate: ( string ) => string,
		isSiteUpgradeable: true,
		isSiteOnPaidPlan: false,
		selectedSite: {
			ID: 500,
			slug: 'domain.com',
		},
		selectedSiteId: 500,
		selectedSiteSlug: 'domain.com',
	};

	test( 'does not blow up with default props', () => {
		render( <MapDomain { ...defaultProps } /> );
		expect( screen.queryByText( /map a domain/i ) ).toBeInTheDocument();
	} );

	test( 'redirects if site cannot be upgraded at mounting', () => {
		render( <MapDomain { ...defaultProps } isSiteUpgradeable={ false } /> );
		expect( pageSpy.redirect ).toHaveBeenCalledWith( '/domains/add/mapping' );
	} );

	test( 'redirects if site cannot be upgraded at new props', () => {
		const { rerender } = render( <MapDomain { ...defaultProps } isSiteUpgradeable /> );
		rerender(
			<MapDomain { ...defaultProps } isSiteUpgradeable={ false } selectedSiteId={ 501 } />
		);
		expect( pageSpy.redirect ).toHaveBeenCalledWith( '/domains/add/mapping' );
	} );

	test( 'renders a MapDomainStep', () => {
		render( <MapDomain { ...defaultProps } /> );
		expect( screen.queryByTestId( 'map-domain-step' ) ).toBeInTheDocument();
	} );

	test( "goes back when HeaderCake's onClick is fired", async () => {
		render( <MapDomain { ...defaultProps } /> );
		const [ backBtn ] = screen.getAllByRole( 'button', { name: /back/i } );
		await userEvent.click( backBtn );
		expect( pageSpy ).toHaveBeenCalledWith( `/domains/add/${ defaultProps.selectedSiteSlug }` );
	} );

	test( 'goes back to /domains/add if no selected site', async () => {
		render( <MapDomain { ...defaultProps } selectedSite={ null } /> );
		const [ backBtn ] = screen.getAllByRole( 'button', { name: /back/i } );
		await userEvent.click( backBtn );
		expect( pageSpy ).toHaveBeenCalledWith( '/domains/add' );
	} );

	test( 'goes back to domain management for VIP sites', async () => {
		render(
			<MapDomain
				{ ...defaultProps }
				selectedSiteSlug="baba"
				selectedSite={ { ...defaultProps.selectedSite, is_vip: true } }
			/>
		);
		const [ backBtn ] = screen.getAllByRole( 'button', { name: /back/i } );
		await userEvent.click( backBtn );
		expect( pageSpy ).toHaveBeenCalledWith( domainManagementList( 'baba' ) );
	} );

	test( 'goes back to domain add page if non-VIP site', async () => {
		render( <MapDomain { ...defaultProps } selectedSiteSlug="baba" /> );
		const [ backBtn ] = screen.getAllByRole( 'button', { name: /back/i } );
		await userEvent.click( backBtn );
		expect( pageSpy ).toHaveBeenCalledWith( '/domains/add/baba' );
	} );

	test( 'does not render a notice by default', () => {
		render( <MapDomain { ...defaultProps } /> );
		expect( screen.queryByLabelText( 'Notice' ) ).not.toBeInTheDocument();
	} );

	test( 'render a notice by when there is an errorMessage in the state', async () => {
		MapDomainStep.mockImplementationOnce( ( { onMapDomain } ) => (
			<button onClick={ onMapDomain } data-testid="map-domain-step" />
		) );
		render( <MapDomain { ...defaultProps } isSiteOnPaidPlan /> );

		const mapDomainBtn = screen.getByTestId( 'map-domain-step' );

		jest
			.spyOn( wpcom.req, 'post' )
			.mockImplementationOnce( () => Promise.reject( new Error( 'arbitrary failure' ) ) );

		await userEvent.click( mapDomainBtn );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'arbitrary failure' );
	} );
} );
