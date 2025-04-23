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
	title: string;
	backLink?: string;
	backLinkText?: string;
	rightElement?: ReactNode;
	onBackClick?: ( e: React.MouseEvent< HTMLAnchorElement > ) => void;
	buttonProps?: ButtonProps;
	downloadProps?: DownloadProps;
	children?: ReactNode;
}

// Arrow left icon component
const ArrowLeftIcon: React.FC = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M15 18L9 12L15 6"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

// Download icon component
const DownloadIcon: React.FC = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M7 10L12 15L17 10"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
		<path
			d="M12 15V3"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
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
 * @param props.children - Child elements to render in the right section
 * @returns The rendered NavigationHeader component
 */
const NavigationHeader: React.FC< HeaderProps > = ( {
	title,
	backLink,
	backLinkText = translate( 'Back' ),
	rightElement,
	onBackClick,
	buttonProps,
	downloadProps,
	children,
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
		<header className="calypso-navigation-header" { ...rest }>
			<div className="calypso-navigation-header__left-section">
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
						<ArrowLeftIcon /> { backLinkText }
					</a>
				) }
				<h1 className="calypso-navigation-header__title">{ title }</h1>
			</div>
			<div className="calypso-navigation-header__right-section">
				{ renderRightElement() }
				{ children }
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
