/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { Banner } from '../index';

jest.mock( 'calypso/state/analytics/actions', () => {
	return {
		recordTracksEvent: jest.fn( () => ( {
			type: 'ANALYTICS_EVENT_RECORD',
		} ) ),
	};
} );

function renderWithRedux( ui ) {
	return renderWithProvider( ui, {
		reducers: {
			preferences: preferencesReducer,
		},
		initialState: { preferences: { remoteValues: {} } },
	} );
}

const props = {
	callToAction: null,
	title: 'banner title',
};

describe( 'Banner basic tests', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'should not blow up and have proper CSS class', () => {
		const { container } = render( <Banner { ...props } /> );
		expect( container.firstChild ).toHaveClass( 'banner' );
	} );

	test( 'should render Card if dismissPreferenceName is null', () => {
		const { container } = render( <Banner { ...props } dismissPreferenceName={ null } /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).not.toHaveClass( 'is-dismissible' );
	} );

	test( 'should render DismissibleCard if dismissPreferenceName is defined', () => {
		renderWithRedux( <Banner { ...props } dismissPreferenceName={ 'banner-test' } /> );
		expect( screen.getByLabelText( 'Dismiss' ) ).toBeInTheDocument();
	} );

	test( 'should have .has-call-to-action class if callToAction is defined', () => {
		const { container } = render( <Banner { ...props } callToAction={ 'Upgrade Now!' } /> );
		expect( container.firstChild ).toHaveClass( 'has-call-to-action' );
	} );

	test( 'should not have .has-call-to-action class if callToAction is null', () => {
		const { container } = render( <Banner { ...props } callToAction={ null } /> );
		expect( container.firstChild ).not.toHaveClass( 'has-call-to-action' );
	} );

	test( 'should render a <Button /> when callToAction is specified', () => {
		render( <Banner { ...props } callToAction={ 'Buy something!' } /> );
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Buy something!' );
	} );

	test( 'should not render a <Button /> when callToAction is not specified', () => {
		render( <Banner { ...props } /> );
		expect( screen.queryByRole( 'button' ) ).toBeNull();
	} );

	test( 'should have .is-jetpack class and JetpackLogo if jetpack prop is defined', () => {
		const { plan, ...propsWithoutPlan } = props;
		const { container } = render( <Banner { ...propsWithoutPlan } jetpack /> );
		expect( container.firstChild ).toHaveClass( 'is-jetpack' );
		expect( container.getElementsByTagName( 'svg' ).length ).toBe( 1 );
	} );

	test( 'should render have .is-horizontal class if horizontal prop is defined', () => {
		const { container } = render( <Banner { ...props } horizontal /> );
		expect( container.getElementsByClassName( 'is-horizontal' ).length ).toBe( 1 );
	} );

	test( 'should render a <PlanPrice /> when price is specified', () => {
		render( <Banner { ...props } price={ 100 } /> );
		expect( screen.getByText( '100' ) ).toBeVisible();
	} );

	test( 'should render two <PlanPrice /> components when there are two prices', () => {
		render( <Banner { ...props } price={ [ 100, 80 ] } /> );
		expect( screen.getByText( '100' ) ).toBeVisible();
		expect( screen.getByText( '80' ) ).toBeVisible();
	} );

	test( 'should render no <PlanPrice /> components when there are no prices', () => {
		const { container } = render( <Banner { ...props } /> );
		expect( container.getElementsByClassName( 'plan-price__integer' ).length ).toBe( 0 );
	} );

	test( 'should render a .banner__description when description is specified', () => {
		render( <Banner { ...props } description="test" /> );
		expect( screen.getByText( 'test' ) ).toBeVisible();
	} );

	test( 'should not render a .banner__description when description is not specified', () => {
		const { container } = render( <Banner { ...props } /> );
		expect( container.getElementsByClassName( 'banner__description"' ).length ).toBe( 0 );
	} );

	test( 'should render a .banner__list when list is specified', () => {
		const { container } = render( <Banner { ...props } list={ [ 'test1', 'test2' ] } /> );
		expect( container.querySelectorAll( '.banner__list' ).length ).toBe( 1 );
		expect( container.querySelectorAll( '.banner__list li' ).length ).toBe( 2 );
		expect( screen.getByText( 'test1' ) ).toBeVisible();
		expect( screen.getByText( 'test2' ) ).toBeVisible();
	} );

	test( 'should not render a .banner__list when description is not specified', () => {
		const { container } = render( <Banner { ...props } /> );
		expect( container.getElementsByClassName( '.banner__list' ) ).toHaveLength( 0 );
	} );

	test( 'should record Tracks event when event is specified', () => {
		renderWithProvider( <Banner { ...props } event="test" /> );
		expect( recordTracksEvent.mock.calls[ 0 ][ 1 ].cta_name ).toBe( 'test' );
	} );

	test( 'should not record Tracks event when event is not specified', () => {
		renderWithProvider( <Banner { ...props } /> );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'should render Card with href if href prop is passed', () => {
		const { container } = render( <Banner { ...props } href={ '/' } /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with no href if href prop is passed but disableHref is true', () => {
		const { container } = render( <Banner { ...props } href={ '/' } disableHref={ true } /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).not.toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with href if href prop is passed but disableHref is true and forceHref is true', () => {
		const { container } = render(
			<Banner { ...props } href={ '/' } disableHref={ true } forceHref={ true } />
		);
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with no href and CTA button with href if href prop is passed and callToAction is also passed', async () => {
		const handleClick = jest.fn();
		const { container } = render(
			<Banner { ...props } href={ '/' } callToAction="Go WordPress!" onClick={ handleClick } />
		);

		await userEvent.click( container.firstChild );
		await userEvent.click( screen.getByText( 'Go WordPress!' ) );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );

		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild.href ).toBeUndefined();

		expect( screen.getByText( 'Go WordPress!' ) ).toBeVisible();
		expect( screen.getByText( 'Go WordPress!' ) ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with href and CTA button with no href if href prop is passed and callToAction is also passed and forceHref is true', async () => {
		const handleClick = jest.fn();
		const { container } = render(
			<Banner
				{ ...props }
				href={ '/' }
				callToAction="Go WordPress!"
				forceHref={ true }
				onClick={ handleClick }
			/>
		);

		await userEvent.click( container.firstChild );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );

		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );

		expect( screen.getByRole( 'button' ) ).toBeVisible();
		expect( screen.getByRole( 'button' ).href ).toBeUndefined();
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Go WordPress!' );
	} );
} );
