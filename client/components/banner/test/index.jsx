/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { Banner } from '../index';

jest.mock( 'calypso/state/analytics/actions', () => ( {
	recordTracksEvent: jest.fn( () => ( {
		type: 'ANALYTICS_EVENT_RECORD',
	} ) ),
} ) );

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

	test( 'should render Card if dismissPreferenceName is null', () => {
		const { container } = render( <Banner { ...props } dismissPreferenceName={ null } /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).not.toHaveClass( 'is-dismissible' );
	} );

	test( 'should render DismissibleCard if dismissPreferenceName is defined', () => {
		renderWithRedux( <Banner { ...props } dismissPreferenceName="banner-test" /> );
		expect( screen.getByLabelText( 'Dismiss' ) ).toBeVisible();
	} );

	test( 'should render a <Button /> when callToAction is specified', () => {
		render( <Banner { ...props } callToAction="Buy something!" /> );
		expect( screen.getByRole( 'button' ) ).toHaveTextContent( 'Buy something!' );
	} );

	test( 'should not render a <Button /> when callToAction is not specified', () => {
		render( <Banner { ...props } /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	test( 'should have .is-jetpack class and JetpackLogo if jetpack prop is defined', () => {
		const { plan, ...propsWithoutPlan } = props;
		const { container } = render( <Banner { ...propsWithoutPlan } jetpack /> );
		expect( container.firstChild ).toHaveClass( 'is-jetpack' );
		expect( container.getElementsByClassName( 'jetpack-logo' ) ).toHaveLength( 1 );
	} );

	test( 'should render have .is-horizontal class if horizontal prop is defined', () => {
		const { container } = render( <Banner { ...props } horizontal /> );
		expect( container.firstChild ).toHaveClass( 'is-horizontal' );
	} );

	test( 'should render a <PlanPrice /> when price is specified', () => {
		const { container } = render( <Banner { ...props } price={ 100 } /> );
		expect( container.getElementsByClassName( 'plan-price' ) ).toHaveLength( 1 );
		const [ price ] = container.getElementsByClassName( 'plan-price__integer' );
		expect( price ).toHaveTextContent( '100' );
	} );

	test( 'should render two <PlanPrice /> components when there are two prices', () => {
		const { container } = render( <Banner { ...props } price={ [ 100, 80 ] } /> );
		expect( container.getElementsByClassName( 'plan-price' ) ).toHaveLength( 2 );

		const [ price1, price2 ] = container.getElementsByClassName( 'plan-price__integer' );
		expect( price1 ).toHaveTextContent( 100 );
		expect( price2 ).toHaveTextContent( 80 );
	} );

	test( 'should render no <PlanPrice /> components when there are no prices', () => {
		render( <Banner { ...props } /> );
		expect( screen.queryByTestId( 'plan-price' ) ).not.toBeInTheDocument();
	} );

	test( 'should render a .banner__description when description is specified', () => {
		render( <Banner { ...props } description="test" /> );
		expect( screen.getByText( 'test' ) ).toHaveClass( 'banner__description' );
	} );

	test( 'should not render a .banner__description when description is not specified', () => {
		const { container } = render( <Banner { ...props } /> );
		expect( container.getElementsByClassName( 'banner__description' ) ).toHaveLength( 0 );
	} );

	test( 'should render a .banner__list when list is specified', () => {
		render( <Banner { ...props } list={ [ 'test1', 'test2' ] } /> );
		expect( screen.queryByRole( 'list' ) ).toBeVisible();
		expect( screen.queryAllByRole( 'listitem' ) ).toHaveLength( 2 );
		expect( screen.queryAllByRole( 'listitem' )[ 0 ] ).toHaveTextContent( 'test1' );
		expect( screen.queryAllByRole( 'listitem' )[ 1 ] ).toHaveTextContent( 'test2' );
	} );

	test( 'should not render a .banner__list when description is not specified', () => {
		render( <Banner { ...props } /> );
		expect( screen.queryByRole( 'list' ) ).not.toBeInTheDocument();
	} );

	test( 'should record Tracks event when event is specified', () => {
		renderWithProvider( <Banner { ...props } event="test" /> );
		expect( recordTracksEvent ).toHaveBeenCalledWith(
			'calypso_banner_cta_impression',
			expect.objectContaining( {
				cta_name: 'test',
			} )
		);
	} );

	test( 'should not record Tracks event when event is not specified', () => {
		renderWithProvider( <Banner { ...props } /> );
		expect( recordTracksEvent ).not.toHaveBeenCalled();
	} );

	test( 'should render Card with href if href prop is passed', () => {
		const { container } = render( <Banner { ...props } href="/" /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with no href if href prop is passed but disableHref is true', () => {
		const { container } = render( <Banner { ...props } href="/" disableHref /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).not.toHaveAttribute( 'href' );
	} );

	test( 'should render Card with href if href prop is passed but disableHref is true and forceHref is true', () => {
		const { container } = render( <Banner { ...props } href="/" disableHref forceHref /> );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with no href and CTA button with href if href prop is passed and callToAction is also passed', async () => {
		const handleClick = jest.fn();
		const { container } = render(
			<Banner { ...props } href="/" callToAction="Go WordPress!" onClick={ handleClick } />
		);
		const btnText = screen.getByText( 'Go WordPress!' );
		await userEvent.click( btnText );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).not.toHaveAttribute( 'href' );
		expect( btnText ).toBeVisible();
		expect( btnText ).toHaveAttribute( 'href', '/' );
	} );

	test( 'should render Card with href and CTA button with no href if href prop is passed and callToAction is also passed and forceHref is true', async () => {
		const handleClick = jest.fn();
		const { container } = render(
			<Banner
				{ ...props }
				href="/"
				callToAction="Go WordPress!"
				forceHref
				onClick={ handleClick }
			/>
		);
		const btn = screen.getByRole( 'button' );
		await userEvent.click( container.firstChild );

		expect( handleClick ).toHaveBeenCalledTimes( 1 );
		expect( container.firstChild ).toHaveClass( 'card' );
		expect( container.firstChild ).toHaveAttribute( 'href', '/' );
		expect( btn ).toBeVisible();
		expect( btn ).not.toHaveAttribute( 'href' );
		expect( btn ).toHaveTextContent( 'Go WordPress!' );
	} );
} );
