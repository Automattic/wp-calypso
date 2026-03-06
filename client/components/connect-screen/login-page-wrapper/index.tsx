import { FormLabel } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { Step } from '@automattic/onboarding';
import { createInterpolateElement, isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { FormDivider } from 'calypso/blocks/authentication';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { ActionButtons } from '../action-buttons';
import { BrandHeader } from '../brand-header';
import { ConsentText } from '../consent-text';
import { LoadingScreen } from '../loading-screen';
import { ScreenLayout } from '../screen-layout';
import type { ChangeEvent, MouseEvent, ReactNode } from 'react';

import './style.scss';

export interface LoginPageWrapperLink {
	label: ReactNode;
	href: string;
	onClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
	rel?: string;
	target?: string;
}

function buildSecureRel( target?: string, rel?: string ): string | undefined {
	if ( target !== '_blank' ) {
		return rel;
	}

	// Opening links in a new tab gives that new page a handle back to this window
	// (`window.opener`) unless we explicitly prevent it. A malicious page could use
	// that handle to navigate our tab to a phishing URL (tabnabbing).
	// We always add both values so every _blank link is safe by default.
	const relValues = new Set( ( rel ?? '' ).split( ' ' ).filter( Boolean ) );
	relValues.add( 'noopener' );
	relValues.add( 'noreferrer' );

	return Array.from( relValues ).join( ' ' );
}

export interface LoginPageWrapperBranding {
	logo?: string | ReactNode;
	logoAlt?: string;
	logoWidth?: number;
	logoHeight?: number;
	topBarLogo?: string | ReactNode;
	topBarLogoAlt?: string;
	topBarLogoWidth?: number;
	topBarLogoHeight?: number;
}

export interface LoginPageWrapperProps {
	title: ReactNode;
	branding?: LoginPageWrapperBranding;
	primaryNavLink?: LoginPageWrapperLink;
	secondaryNavLink?: LoginPageWrapperLink;
	redirectTo?: string;
	isLoading?: boolean;
	loadingMessage?: ReactNode;
	beforeContent?: ReactNode;
	usernameOrEmail?: string;
	defaultUsernameOrEmail?: string;
	onUsernameOrEmailChange?: ( value: string ) => void;
	usernameOrEmailInputId?: string;
	usernameOrEmailInputName?: string;
	showTermsNotice?: boolean;
	termsNotice?: ReactNode;
	showForgotPasswordLink?: boolean;
	forgotPasswordHref?: string;
	onForgotPasswordClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
	primaryActionLabel?: ReactNode;
	onPrimaryActionClick?: () => void;
	primaryActionType?: 'button' | 'submit';
	primaryActionLoading?: boolean;
	primaryActionDisabled?: boolean;
	primaryActionClassName?: string;
	secondaryActionLabel?: ReactNode;
	secondaryActionOnClick?: () => void;
	secondaryActionDisabled?: boolean;
	secondaryActionClassName?: string;
	tertiaryActionLabel?: ReactNode;
	tertiaryActionOnClick?: () => void;
	actionButtonsClassName?: string;
	children?: ReactNode;
	/**
	 * Optional right-side social buttons column.
	 * Pass a composition using components from `calypso/components/social-buttons`.
	 */
	socialButtons?: ReactNode;
	showSocialDivider?: boolean;
	footer?: ReactNode;
	className?: string;
	contentClassName?: string;
	socialColumnClassName?: string;
	backgroundColor?: string;
}

function addRedirectToQuery( href: string, redirectTo?: string ): string {
	if ( ! redirectTo || href.startsWith( 'mailto:' ) || href.startsWith( 'tel:' ) ) {
		return href;
	}

	try {
		const isAbsoluteHref = /^[a-z][a-z\d+.-]*:/i.test( href );
		const baseUrl =
			typeof window !== 'undefined' ? window.location.origin : 'https://wordpress.com';
		const url = new URL( href, baseUrl );

		if ( ! url.searchParams.has( 'redirect_to' ) ) {
			url.searchParams.set( 'redirect_to', redirectTo );
		}

		if ( isAbsoluteHref ) {
			return url.toString();
		}

		return `${ url.pathname }${ url.search }${ url.hash }`;
	} catch {
		return href;
	}
}

function renderLogo(
	logo: string | ReactNode | undefined,
	logoAlt?: string,
	logoWidth?: number,
	logoHeight?: number
): ReactNode {
	if ( ! logo ) {
		return null;
	}

	if ( isValidElement( logo ) ) {
		return logo;
	}

	if ( typeof logo === 'string' ) {
		return <img src={ logo } alt={ logoAlt ?? '' } width={ logoWidth } height={ logoHeight } />;
	}

	return null;
}

/**
 * Shared wrapper for login-style connect screens.
 */
export function LoginPageWrapper( {
	title,
	branding,
	primaryNavLink,
	secondaryNavLink,
	redirectTo,
	isLoading = false,
	loadingMessage,
	beforeContent,
	usernameOrEmail,
	defaultUsernameOrEmail,
	onUsernameOrEmailChange,
	usernameOrEmailInputId = 'usernameOrEmail',
	usernameOrEmailInputName = 'usernameOrEmail',
	showTermsNotice = true,
	termsNotice,
	showForgotPasswordLink = true,
	forgotPasswordHref = '/log-in/lostpassword',
	onForgotPasswordClick,
	primaryActionLabel,
	onPrimaryActionClick = () => {},
	primaryActionType = 'button',
	primaryActionLoading = false,
	primaryActionDisabled = false,
	primaryActionClassName,
	secondaryActionLabel,
	secondaryActionOnClick,
	secondaryActionDisabled = false,
	secondaryActionClassName,
	tertiaryActionLabel,
	tertiaryActionOnClick,
	actionButtonsClassName,
	children,
	socialButtons,
	showSocialDivider = true,
	footer,
	className,
	contentClassName,
	socialColumnClassName,
	backgroundColor,
}: LoginPageWrapperProps ): JSX.Element {
	const translate = useTranslate();
	const [ localUsernameOrEmailValue, setLocalUsernameOrEmailValue ] = useState(
		defaultUsernameOrEmail ?? ''
	);
	const isSocialFirst = Boolean( socialButtons );
	const loginIdentifierValue =
		typeof usernameOrEmail !== 'undefined' ? usernameOrEmail : localUsernameOrEmailValue;

	const handleUsernameOrEmailChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const nextValue = event.target.value;

		onUsernameOrEmailChange?.( nextValue );

		if ( typeof usernameOrEmail === 'undefined' ) {
			setLocalUsernameOrEmailValue( nextValue );
		}
	};

	const usernameOrEmailLabel = (
		<>
			<span className="connect-screen-login-page-wrapper__sr-only">
				{ translate( 'WordPress.com email address or username' ) }
			</span>
			<span aria-hidden="true">{ translate( 'Email address or username' ) }</span>
		</>
	);

	const topBarLogo = renderLogo(
		branding?.topBarLogo,
		branding?.topBarLogoAlt,
		branding?.topBarLogoWidth,
		branding?.topBarLogoHeight
	);

	const primaryNavRel = buildSecureRel( primaryNavLink?.target, primaryNavLink?.rel );
	const secondaryNavRel = buildSecureRel( secondaryNavLink?.target, secondaryNavLink?.rel );

	const renderedTermsNotice =
		termsNotice ??
		createInterpolateElement(
			translate(
				'Just a little reminder that by continuing with any of the options below, you agree to our <tosLink>Terms of Service</tosLink> and <privacyLink>Privacy Policy</privacyLink>.'
			),
			{
				tosLink: (
					<a
						href={ localizeUrl( 'https://wordpress.com/tos/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
				privacyLink: (
					<a
						href={ localizeUrl( 'https://automattic.com/privacy/' ) }
						target="_blank"
						rel="noopener noreferrer"
					/>
				),
			}
		);

	const renderLoginIdentifierField = () => (
		<div className="connect-screen-login-page-wrapper__login-field">
			<FormLabel
				hasCoreStylesNoCaps
				htmlFor={ usernameOrEmailInputId }
				className="connect-screen-login-page-wrapper__login-label"
			>
				{ usernameOrEmailLabel }
			</FormLabel>
			<FormTextInput
				autoCapitalize="off"
				autoCorrect="off"
				spellCheck="false"
				autoComplete="username"
				hasCoreStyles
				id={ usernameOrEmailInputId }
				name={ usernameOrEmailInputName }
				value={ loginIdentifierValue }
				onChange={ handleUsernameOrEmailChange }
				className="connect-screen-login-page-wrapper__login-input"
			/>
		</div>
	);

	const renderFormArea = () => (
		<>
			{ renderLoginIdentifierField() }
			{ children }
			<div className="connect-screen-login-page-wrapper__actions">
				<ActionButtons
					primaryLabel={ primaryActionLabel ?? translate( 'Log in' ) }
					primaryOnClick={ onPrimaryActionClick }
					primaryType={ primaryActionType }
					primaryLoading={ primaryActionLoading }
					primaryDisabled={ primaryActionDisabled }
					primaryClassName={ primaryActionClassName }
					secondaryLabel={ secondaryActionLabel }
					secondaryOnClick={ secondaryActionOnClick }
					secondaryDisabled={ secondaryActionDisabled }
					secondaryClassName={ secondaryActionClassName }
					tertiaryLabel={ tertiaryActionLabel }
					tertiaryOnClick={ tertiaryActionOnClick }
					className={ actionButtonsClassName }
				/>
			</div>
		</>
	);

	return (
		<>
			<div className="connect-screen-login-page-wrapper__top-bar-shell">
				<Step.TopBar
					compactLogo="always"
					logo={ topBarLogo ?? undefined }
					hideLogo={ ! topBarLogo }
					rightElement={
						<nav className="connect-screen-login-page-wrapper__top-bar-nav">
							{ secondaryNavLink && (
								<a
									className="connect-screen-login-page-wrapper__top-bar-link"
									href={ addRedirectToQuery( secondaryNavLink.href, redirectTo ) }
									onClick={ secondaryNavLink.onClick }
									target={ secondaryNavLink.target }
									rel={ secondaryNavRel }
								>
									{ secondaryNavLink.label }
								</a>
							) }
							{ primaryNavLink && (
								<a
									className="connect-screen-login-page-wrapper__top-bar-link"
									href={ addRedirectToQuery( primaryNavLink.href, redirectTo ) }
									onClick={ primaryNavLink.onClick }
									target={ primaryNavLink.target }
									rel={ primaryNavRel }
								>
									{ primaryNavLink.label }
								</a>
							) }
						</nav>
					}
				/>
			</div>
			<ScreenLayout
				className="connect-screen-login-page-wrapper__layout"
				backgroundColor={ backgroundColor }
				containerMaxWidth={ 660 }
			>
				<div
					className={ clsx( 'connect-screen-login-page-wrapper', className, {
						'connect-screen-login-page-wrapper--social-first': isSocialFirst,
					} ) }
				>
					<BrandHeader
						logo={ branding?.logo }
						logoAlt={ branding?.logoAlt }
						logoWidth={ branding?.logoWidth }
						logoHeight={ branding?.logoHeight }
						title={ title }
						className="connect-screen-login-page-wrapper__header"
					/>

					{ showTermsNotice && (
						<ConsentText className="connect-screen-login-page-wrapper__terms-notice">
							{ renderedTermsNotice }
						</ConsentText>
					) }

					{ isLoading ? (
						<LoadingScreen
							message={ loadingMessage }
							className="connect-screen-login-page-wrapper__loading"
						/>
					) : (
						<>
							{ beforeContent && (
								<div className="connect-screen-login-page-wrapper__before-content">
									{ beforeContent }
								</div>
							) }
							<div
								className={ clsx(
									'connect-screen-login-page-wrapper__content',
									! isSocialFirst && contentClassName
								) }
							>
								{ isSocialFirst ? (
									<div className="connect-screen-login-page-wrapper__columns is-social-first">
										<div
											className={ clsx(
												'connect-screen-login-page-wrapper__column',
												'connect-screen-login-page-wrapper__column--form'
											) }
										>
											{ renderFormArea() }
										</div>
										{ showSocialDivider && <FormDivider isHorizontal={ false } /> }
										<div
											className={ clsx(
												'connect-screen-login-page-wrapper__column',
												'connect-screen-login-page-wrapper__column--social',
												socialColumnClassName
											) }
										>
											{ socialButtons }
										</div>
									</div>
								) : (
									<div
										className={ clsx(
											'connect-screen-login-page-wrapper__column',
											'connect-screen-login-page-wrapper__column--form'
										) }
									>
										{ renderFormArea() }
									</div>
								) }
							</div>
							{ showForgotPasswordLink && (
								<div className="connect-screen-login-page-wrapper__forgot-password-wrapper">
									<a
										className="connect-screen-login-page-wrapper__forgot-password-link"
										href={ addRedirectToQuery( forgotPasswordHref, redirectTo ) }
										onClick={ onForgotPasswordClick }
									>
										{ translate( 'Forgot password?' ) }
									</a>
								</div>
							) }
							{ footer && (
								<div className="connect-screen-login-page-wrapper__footer">{ footer }</div>
							) }
						</>
					) }
				</div>
			</ScreenLayout>
		</>
	);
}
