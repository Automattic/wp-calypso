import clsx from 'clsx';
import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';
import './navigation-header.scss';

// Type definitions for the props
interface BackLinkProps {
	url?: string;
	text?: string;
	onBackClick?: ( e: React.MouseEvent< HTMLAnchorElement > ) => void;
}

export interface HeaderProps extends React.HTMLAttributes< HTMLElement > {
	title?: string;
	titleLogo?: ReactNode;
	backLinkProps?: BackLinkProps;
	titleElement?: ReactNode;
	headElement?: ReactNode;
	rightSection?: ReactNode;
	hasScreenOptionsTab?: boolean;
	titleProps?: {
		title?: string;
		titleLogo?: ReactNode;
	};
}

/**
 * Header component that can be used in various contexts
 * @param props - Component props
 * @param props.className - Additional CSS class name for the component
 * @param props.titleProps - Header title props
 * @param props.backLinkProps - Object containing back link properties (backLink URL, backLinkText, and onBackClick handler)
 * @param props.titleElement - Custom element to override default title rendering
 * @param props.headElement - Custom element to override default head section rendering
 * @param props.rightSection - Child elements to render in the right section
 * @param props.hasScreenOptionsTab - Indicates whether the screen options tab should be added
 * @returns The rendered NavigationHeader component
 */
const NavigationHeader: React.FC< HeaderProps > = ( {
	className,
	titleProps,
	backLinkProps,
	titleElement,
	headElement = backLinkProps?.url && (
		<a
			className="calypso-navigation-header__back-link"
			href={ backLinkProps?.url }
			onClick={ ( e ) => {
				if ( backLinkProps?.onBackClick ) {
					e.preventDefault();
					backLinkProps.onBackClick( e );
				}
			} }
		>
			← { backLinkProps?.text ?? translate( 'Back' ) }
		</a>
	),
	rightSection,
	hasScreenOptionsTab,
	...rest
} ) => {
	const defaultTitleElement = (
		<h1 className="calypso-navigation-header__title">
			{ titleProps?.titleLogo && (
				<span className="calypso-navigation-header__title-logo" aria-hidden="true">
					{ titleProps.titleLogo }
				</span>
			) }
			{ titleProps?.title && titleProps?.titleLogo ? (
				<span className="calypso-navigation-header__title-text">{ titleProps?.title }</span>
			) : (
				titleProps?.title
			) }
		</h1>
	);

	const finalTitleElement = titleElement ?? defaultTitleElement;

	return (
		<header
			className={ clsx( 'calypso-navigation-header', className, {
				'calypso-navigation-header__screen-options-tab': hasScreenOptionsTab,
			} ) }
			{ ...rest }
		>
			<div className="calypso-navigation-header__head">{ headElement }</div>
			<div className="calypso-navigation-header__body">
				<div className="calypso-navigation-header__left-section">{ finalTitleElement }</div>
				{ rightSection && (
					<div className="calypso-navigation-header__right-section">{ rightSection }</div>
				) }
			</div>
		</header>
	);
};

export default NavigationHeader;
