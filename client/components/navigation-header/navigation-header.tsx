import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';
import './navigation-header.scss';

// Type definitions for the props
interface ButtonProps extends React.ButtonHTMLAttributes< HTMLButtonElement > {
	text?: string;
	onClick?: ( e: React.MouseEvent< HTMLButtonElement > ) => void;
}

interface DownloadProps extends React.AnchorHTMLAttributes< HTMLAnchorElement > {
	text?: string;
	href?: string;
	download?: boolean | string;
}

interface HeaderProps extends React.HTMLAttributes< HTMLElement > {
	title?: string;
	backLink?: string;
	backLinkText?: string;
	rightElement?: ReactNode;
	onBackClick?: ( e: React.MouseEvent< HTMLAnchorElement > ) => void;
	buttonProps?: ButtonProps;
	downloadProps?: DownloadProps;
	titleElement?: ReactNode;
	children?: ReactNode;
	hasScreenOptionsTab?: boolean;
}

// Download icon component
const DownloadIcon: React.FC = () => (
	<svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M14 8.3L13 7.2L9 11.2V0H7.5V11.3L3 7.2L2 8.3L8.2 14.1L14 8.3ZM14.5 12V15.5H1.5V12H0V17H16V12H14.5Z"
			fill="#008710"
		/>
	</svg>
);

/**
 * Header component that can be used in various contexts
 *
 * @param props - Component props
 * @param props.title - Header title text
 * @param props.backLink - URL for the back button
 * @param props.backLinkText - Text for the back button
 * @param props.rightElement - Custom element to display on the right side
 * @param props.onBackClick - Function to call when back button is clicked
 * @param props.buttonProps - Props for the action button if used
 * @param props.downloadProps - Props for the download link if used
 * @param props.titleElement - Custom element to override default title rendering
 * @param props.children - Child elements to render in the right section
 * @param props.hasScreenOptionsTab - Indicates whether the screen options tab should be added
 * @returns The rendered NavigationHeader component
 */
const NavigationHeader: React.FC< HeaderProps > = ( {
	title,
	backLink,
	backLinkText = translate( 'Back' ),
	rightElement,
	onBackClick,
	titleElement = <h1 className="calypso-navigation-header__title">{ title }</h1>,
	buttonProps,
	downloadProps,
	children,
	hasScreenOptionsTab,
	...rest
} ) => {
	// Determine what to render on the right side
	const renderRightElement = (): ReactNode => {
		if ( rightElement ) {
			return rightElement;
		} else if ( buttonProps ) {
			return (
				<button
					className="calypso-navigation-header__action-button"
					onClick={ buttonProps.onClick }
					{ ...buttonProps }
				>
					{ buttonProps.text || 'View post' }
				</button>
			);
		} else if ( downloadProps ) {
			return (
				<a
					className="calypso-navigation-header__download-link"
					href={ downloadProps.href || '#' }
					download={ downloadProps.download }
					{ ...downloadProps }
				>
					<DownloadIcon />
					{ downloadProps.text || 'Download CSV' }
				</a>
			);
		}
		return null;
	};

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
				<div className="calypso-navigation-header__right-section">
					{ renderRightElement() }
					{ children }
				</div>
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
