import { isValidElement } from '@wordpress/element';
import clsx from 'clsx';
import { BrandHeader } from '../brand-header';
import { LoadingScreen } from '../loading-screen';
import { ScreenLayout } from '../screen-layout';
import type { CSSProperties, MouseEvent, ReactNode } from 'react';

import './style.scss';

export interface LoginPageWrapperLink {
	label: ReactNode;
	href: string;
	onClick?: ( event: MouseEvent< HTMLAnchorElement > ) => void;
	rel?: string;
	target?: string;
}

export interface LoginPageWrapperColors {
	backgroundColor?: string;
	textColor?: string;
	linkColor?: string;
	accentColor?: string;
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
	colors?: LoginPageWrapperColors;
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
	children,
	socialButtons,
	showSocialDivider = true,
	footer,
	className,
	contentClassName,
	socialColumnClassName,
	backgroundColor,
}: LoginPageWrapperProps ): JSX.Element {
	const isSocialFirst = Boolean( socialButtons );

	const customStyles: CSSProperties = {
		'--connect-screen-login-page-wrapper-text-color': branding?.colors?.textColor,
		'--connect-screen-login-page-wrapper-link-color': branding?.colors?.linkColor,
		'--connect-screen-login-page-wrapper-accent-color': branding?.colors?.accentColor,
	} as CSSProperties;

	const topBarLogo = renderLogo(
		branding?.topBarLogo,
		branding?.topBarLogoAlt,
		branding?.topBarLogoWidth,
		branding?.topBarLogoHeight
	);

	return (
		<ScreenLayout backgroundColor={ branding?.colors?.backgroundColor ?? backgroundColor }>
			<div
				className={ clsx( 'connect-screen-login-page-wrapper', className, {
					'connect-screen-login-page-wrapper--social-first': isSocialFirst,
				} ) }
				style={ customStyles }
			>
				<div className="connect-screen-login-page-wrapper__top-bar">
					<div className="connect-screen-login-page-wrapper__top-bar-start">
						{ topBarLogo && (
							<div className="connect-screen-login-page-wrapper__top-bar-logo">{ topBarLogo }</div>
						) }
					</div>
					<div className="connect-screen-login-page-wrapper__top-bar-end">
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
					</div>
				</div>

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
								<div className="connect-screen-login-page-wrapper__columns">
									<div
										className={ clsx(
											'connect-screen-login-page-wrapper__column',
											'connect-screen-login-page-wrapper__column--form',
											contentClassName
										) }
									>
										{ children }
									</div>
									{ showSocialDivider && (
										<div
											className="connect-screen-login-page-wrapper__divider"
											aria-hidden="true"
										/>
									) }
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
	);
}
