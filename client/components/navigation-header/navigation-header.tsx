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
			<div className="calypso-navigation-header__head">
				{ backLink && (
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
				) }
			</div>
			<div className="calypso-navigation-header__body">
				<div className="calypso-navigation-header__left-section">{ titleElement }</div>
				<div className="calypso-navigation-header__right-section">{ children }</div>
			</div>
		</header>
	);
};

export default NavigationHeader;

// Example usage:
// For first image (Post with View post button):
// <Header
//   title="Post"
//   buttonProps={{
//     text: "View post",
//     onClick: () => console.log("View post clicked")
//   }}
// />

// For second image (Summary page with Download CSV link):
// <Header
//   title="Summary page"
//   downloadProps={{
//     href: "/data.csv",
//     text: "Download CSV"
//   }}
// />

// With custom element:
// <Header
//   title="Custom Header"
//   rightElement={<YourCustomComponent />}
// />

// With screen options tab:
// <Header
//   title="With Options"
//   hasScreenOptionsTab={true}
// />
