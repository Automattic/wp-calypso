import { FormLabel } from '@automattic/components';
import { Step } from '@automattic/onboarding';
import { isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { FormDivider } from 'calypso/blocks/authentication';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { BrandHeader } from '../brand-header';
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
	description?: ReactNode;
	descriptionSecondary?: ReactNode;
	branding?: LoginPageWrapperBranding;
	primaryNavLink?: LoginPageWrapperLink;
	secondaryNavLink?: LoginPageWrapperLink;
	redirectTo?: string;
	isLoading?: boolean;
	loadingMessage?: ReactNode;
	beforeContent?: ReactNode;
	usernameOrEmail?: string;
	defaultUsernameOrEmail?: string;
	/** @deprecated use usernameOrEmail */
	usernameOrEmailValue?: string;
	onUsernameOrEmailChange?: ( value: string ) => void;
	usernameOrEmailInputId?: string;
	usernameOrEmailInputName?: string;
	children: ReactNode;
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
	description,
	descriptionSecondary,
	branding,
	primaryNavLink,
	secondaryNavLink,
	redirectTo,
	isLoading = false,
	loadingMessage,
	beforeContent,
	usernameOrEmail,
	defaultUsernameOrEmail,
	usernameOrEmailValue,
	onUsernameOrEmailChange,
	usernameOrEmailInputId = 'usernameOrEmail',
	usernameOrEmailInputName = 'usernameOrEmail',
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
	let loginIdentifierValue = localUsernameOrEmailValue;

	if ( typeof usernameOrEmail !== 'undefined' ) {
		loginIdentifierValue = usernameOrEmail;
	} else if ( typeof usernameOrEmailValue !== 'undefined' ) {
		loginIdentifierValue = usernameOrEmailValue;
	}

	const handleUsernameOrEmailChange = ( event: ChangeEvent< HTMLInputElement > ) => {
		const nextValue = event.target.value;

		onUsernameOrEmailChange?.( nextValue );

		if ( typeof usernameOrEmail === 'undefined' && typeof usernameOrEmailValue === 'undefined' ) {
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
									rel={ secondaryNavLink.rel }
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
									rel={ primaryNavLink.rel }
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
						description={ description }
						className="connect-screen-login-page-wrapper__header"
					/>

					{ descriptionSecondary && (
						<p className="connect-screen-login-page-wrapper__description-secondary">
							{ descriptionSecondary }
						</p>
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
												'connect-screen-login-page-wrapper__column--form',
												contentClassName
											) }
										>
											{ renderLoginIdentifierField() }
											{ children }
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
											contentClassName
										) }
									>
										{ renderLoginIdentifierField() }
										{ children }
									</div>
								) }
							</div>
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
