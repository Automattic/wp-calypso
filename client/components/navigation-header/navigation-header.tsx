import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';
import './navigation-header.scss';

// Type definitions for the props
interface HeaderProps extends React.HTMLAttributes< HTMLElement > {
	title?: string;
	backLink?: string;
	backLinkText?: string;
	onBackClick?: ( e: React.MouseEvent< HTMLAnchorElement > ) => void;
	titleElement?: ReactNode;
	linkElement?: ReactNode;
	children?: ReactNode;
	hasScreenOptionsTab?: boolean;
}

/**
 * Header component that can be used in various contexts
 *
 * @param props - Component props
 * @param props.title - Header title text
 * @param props.backLink - URL for the back button
 * @param props.backLinkText - Text for the back button
 * @param props.onBackClick - Function to call when back button is clicked
 * @param props.titleElement - Custom element to override default title rendering
 * @param props.linkElement - Custom element to override default link rendering
 * @param props.children - Child elements to render in the right section
 * @param props.hasScreenOptionsTab - Indicates whether the screen options tab should be added
 * @returns The rendered NavigationHeader component
 */
const NavigationHeader: React.FC< HeaderProps > = ( {
	title,
	backLink,
	backLinkText = translate( 'Back' ),
	onBackClick,
	titleElement = <h1 className="calypso-navigation-header__title">{ title }</h1>,
	linkElement: backLinkElement = (
		<a
			className="calypso-navigation-header__back-link"
			href={ backLink }
			onClick={ ( e ) => {
				if ( onBackClick ) {
					e.preventDefault();
					onBackClick( e );
				}
			} }
		>
			← { backLinkText }
		</a>
	),
	children,
	hasScreenOptionsTab,
	...rest
} ) => {
	return (
		<header
			className={ `calypso-navigation-header${
				hasScreenOptionsTab ? ' calypso-navigation-header__screen-options-tab' : ''
			}` }
			{ ...rest }
		>
			<div className="calypso-navigation-header__head">{ backLink && backLinkElement }</div>
			<div className="calypso-navigation-header__body">
				<div className="calypso-navigation-header__left-section">{ titleElement }</div>
				<div className="calypso-navigation-header__right-section">{ children }</div>
			</div>
		</header>
	);
};

export default NavigationHeader;
