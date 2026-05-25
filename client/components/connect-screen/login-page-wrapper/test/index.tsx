/** @jest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { LoginPageWrapper } from '../index';

describe( 'LoginPageWrapper', () => {
	it( 'renders title and content', () => {
		render(
			<LoginPageWrapper title="Log in to your account">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'heading', { name: 'Log in to your account' } ) ).toBeInTheDocument();
		expect( screen.getByText( 'Form content' ) ).toBeInTheDocument();
		expect( screen.getByText( 'WordPress.com email address or username' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Email address or username' ) ).toBeInTheDocument();

		const termsNode = document.querySelector( '.connect-screen-consent-text' );
		expect( termsNode?.textContent ).toContain(
			'Just a little reminder that by continuing with any of the options below, you agree to our Terms of Service and Privacy Policy.'
		);
		expect( screen.getByRole( 'link', { name: 'Forgot password?' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Log in' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox' ) ).toHaveAttribute( 'name', 'usernameOrEmail' );
	} );

	it( 'renders configurable primary action label and handles click', () => {
		const onPrimaryActionClick = jest.fn();

		render(
			<LoginPageWrapper
				title="Log in"
				primaryActionLabel="Continue"
				onPrimaryActionClick={ onPrimaryActionClick }
			/>
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Continue' } ) );
		expect( onPrimaryActionClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'renders terms links below brand header using ConsentText', () => {
		render(
			<LoginPageWrapper title="Log in">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( document.querySelector( '.connect-screen-consent-text' ) ).toBeInTheDocument();

		expect( screen.getByRole( 'link', { name: 'Terms of Service' } ) ).toHaveAttribute(
			'href',
			'https://wordpress.com/tos/'
		);
		expect( screen.getByRole( 'link', { name: 'Privacy Policy' } ) ).toHaveAttribute(
			'href',
			'https://automattic.com/privacy/'
		);
	} );

	it( 'allows hiding terms notice', () => {
		render(
			<LoginPageWrapper title="Log in" showTermsNotice={ false }>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect(
			screen.queryByText(
				'Just a little reminder that by continuing with any of the options below, you agree to our Terms of Service and Privacy Policy.'
			)
		).not.toBeInTheDocument();
	} );

	it( 'renders forgot password link below form area and supports custom href', () => {
		render(
			<LoginPageWrapper title="Log in" forgotPasswordHref="/log-in/jetpack/lostpassword">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'link', { name: 'Forgot password?' } ) ).toHaveAttribute(
			'href',
			'/log-in/jetpack/lostpassword'
		);
	} );

	it( 'allows hiding forgot password link', () => {
		render(
			<LoginPageWrapper title="Log in" showForgotPasswordLink={ false }>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.queryByRole( 'link', { name: 'Forgot password?' } ) ).not.toBeInTheDocument();
	} );

	it( 'calls onUsernameOrEmailChange with updated value', () => {
		const onUsernameOrEmailChange = jest.fn();

		render(
			<LoginPageWrapper title="Log in" onUsernameOrEmailChange={ onUsernameOrEmailChange }>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		fireEvent.change( screen.getByRole( 'textbox' ), { target: { value: 'demo-user' } } );
		expect( onUsernameOrEmailChange ).toHaveBeenCalledWith( 'demo-user' );
	} );

	it( 'supports controlled usernameOrEmail input', () => {
		render(
			<LoginPageWrapper title="Log in" usernameOrEmail="controlled-user">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'textbox' ) ).toHaveValue( 'controlled-user' );
	} );

	it( 'hides default Step.TopBar logo when no topBar logo is passed', () => {
		const { container } = render(
			<LoginPageWrapper title="Log in">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect(
			container.querySelector( '.step-container-v2__top-bar-wordpress-logo-wrapper' )
		).not.toBeInTheDocument();
	} );

	it( 'renders Step.TopBar outside ScreenLayout container for full viewport width', () => {
		const { container } = render(
			<LoginPageWrapper
				title="Log in"
				primaryNavLink={ {
					label: 'Create an account',
					href: '/start/account',
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		const topBarShell = container.querySelector(
			'.connect-screen-login-page-wrapper__top-bar-shell'
		);
		const layoutContainer = container.querySelector( '.connect-screen-layout__container' );

		expect( topBarShell ).toBeInTheDocument();
		expect( layoutContainer ).toBeInTheDocument();
		expect( layoutContainer?.contains( topBarShell as Node ) ).toBe( false );
	} );

	it( 'renders topBar logo when branding topBarLogo is provided', () => {
		render(
			<LoginPageWrapper
				title="Log in"
				branding={ {
					topBarLogo: 'https://example.com/logo.svg',
					topBarLogoAlt: 'Partner logo',
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'img', { name: 'Partner logo' } ) ).toBeInTheDocument();
	} );

	it( 'applies wrapper className and contentClassName', () => {
		const { container } = render(
			<LoginPageWrapper title="Log in" className="custom-wrapper" contentClassName="custom-content">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( container.querySelector( '.connect-screen-login-page-wrapper' ) ).toHaveClass(
			'custom-wrapper'
		);
		expect( container.querySelector( '.connect-screen-login-page-wrapper__content' ) ).toHaveClass(
			'custom-content'
		);
		expect(
			container.querySelector( '.connect-screen-login-page-wrapper__column' )
		).not.toHaveClass( 'custom-content' );
	} );

	it( 'renders top bar links and appends redirectTo to their href', () => {
		render(
			<LoginPageWrapper
				title="Log in"
				redirectTo="https://example.com/return"
				primaryNavLink={ {
					label: 'Create an account',
					href: '/start/account',
				} }
				secondaryNavLink={ {
					label: 'No thanks',
					href: '/no-thanks?source=login',
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'link', { name: 'Create an account' } ) ).toHaveAttribute(
			'href',
			'/start/account?redirect_to=https%3A%2F%2Fexample.com%2Freturn'
		);
		expect( screen.getByRole( 'link', { name: 'No thanks' } ) ).toHaveAttribute(
			'href',
			'/no-thanks?source=login&redirect_to=https%3A%2F%2Fexample.com%2Freturn'
		);
	} );

	it( 'does not override existing redirect_to query parameter', () => {
		render(
			<LoginPageWrapper
				title="Log in"
				redirectTo="https://example.com/return"
				primaryNavLink={ {
					label: 'Create an account',
					href: '/start/account?redirect_to=https%3A%2F%2Falready.set%2Ftarget',
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'link', { name: 'Create an account' } ) ).toHaveAttribute(
			'href',
			'/start/account?redirect_to=https%3A%2F%2Falready.set%2Ftarget'
		);
	} );

	it( 'renders loading state instead of content when isLoading is true', () => {
		render(
			<LoginPageWrapper title="Log in" isLoading loadingMessage="Loading account data...">
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByText( 'Loading account data...' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Form content' ) ).not.toBeInTheDocument();
	} );

	it( 'renders social-first two-column layout when socialButtons are provided', () => {
		const { container } = render(
			<LoginPageWrapper
				title="Log in"
				socialButtons={ <div data-testid="social-buttons-content">Social buttons</div> }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( container.querySelector( '.connect-screen-login-page-wrapper' ) ).toHaveClass(
			'connect-screen-login-page-wrapper--social-first'
		);
		expect(
			container.querySelector( '.connect-screen-login-page-wrapper__columns' )
		).toBeInTheDocument();
		expect(
			container.querySelector( '.connect-screen-login-page-wrapper__column--form' )
		).toBeInTheDocument();
		expect(
			container.querySelector( '.connect-screen-login-page-wrapper__column--social' )
		).toBeInTheDocument();
		expect( container.querySelector( '.auth-form__separator' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'social-buttons-content' ) ).toBeInTheDocument();
	} );

	it( 'hides social divider when showSocialDivider is false', () => {
		const { container } = render(
			<LoginPageWrapper
				title="Log in"
				showSocialDivider={ false }
				socialButtons={ <div>Social buttons</div> }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( container.querySelector( '.auth-form__separator' ) ).not.toBeInTheDocument();
	} );

	it( 'calls nav link onClick handlers', () => {
		const onPrimaryClick = jest.fn();

		render(
			<LoginPageWrapper
				title="Log in"
				primaryNavLink={ {
					label: 'Create an account',
					href: '/start/account',
					onClick: onPrimaryClick,
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		fireEvent.click( screen.getByRole( 'link', { name: 'Create an account' } ) );
		expect( onPrimaryClick ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'adds noopener noreferrer for _blank top bar links', () => {
		render(
			<LoginPageWrapper
				title="Log in"
				primaryNavLink={ {
					label: 'Create an account',
					href: '/start/account',
					target: '_blank',
				} }
			>
				<div>Form content</div>
			</LoginPageWrapper>
		);

		expect( screen.getByRole( 'link', { name: 'Create an account' } ) ).toHaveAttribute(
			'rel',
			'noopener noreferrer'
		);
	} );
} );
