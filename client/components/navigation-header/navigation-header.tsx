import styled from '@emotion/styled';
import { translate } from 'i18n-calypso';
import { ReactNode } from 'react';

// Main container for the header
const HeaderContainer = styled.header`
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: white;
	box-shadow: 0 1px 3px rgba( 0, 0, 0, 0.05 );
	width: 100%;
`;

// Left section with back button and title
const LeftSection = styled.div`
	display: flex;
	align-items: center;
	gap: 16px;
`;

// Back button/link
const BackLink = styled.a`
	display: flex;
	align-items: center;
	text-decoration: none;
	color: #666;
	font-size: 16px;
	transition: color 0.2s ease;

	&:hover {
		color: #333;
	}

	svg {
		margin-right: 6px;
	}
`;

// Title component that adjusts based on screen size
const Title = styled.h1`
	margin: 0;
	font-size: 24px;
	font-weight: 500;
	color: #333;

	@media ( max-width: 576px ) {
		font-size: 20px;
	}
`;

// Right section for buttons, links, or other elements
const RightSection = styled.div`
	display: flex;
	align-items: center;
`;

// Button styling for the right section
const ActionButton = styled.button`
	padding: 8px 16px;
	background-color: #2e7d32; /* Green color from the image */
	color: white;
	border: none;
	border-radius: 4px;
	font-size: 16px;
	cursor: pointer;
	transition: background-color 0.2s ease;

	&:hover {
		background-color: #1b5e20;
	}

	@media ( max-width: 576px ) {
		padding: 6px 12px;
		font-size: 14px;
	}
`;

// Download link styling
const DownloadLink = styled.a`
	display: flex;
	align-items: center;
	text-decoration: none;
	color: #2e7d32;
	font-size: 16px;
	transition: color 0.2s ease;

	svg {
		margin-right: 8px;
	}

	&:hover {
		color: #1b5e20;
	}
`;

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
				<ActionButton onClick={ buttonProps.onClick } { ...buttonProps }>
					{ buttonProps.text || 'View post' }
				</ActionButton>
			);
		} else if ( downloadProps ) {
			return (
				<DownloadLink
					href={ downloadProps.href || '#' }
					download={ downloadProps.download }
					{ ...downloadProps }
				>
					<DownloadIcon />
					{ downloadProps.text || 'Download CSV' }
				</DownloadLink>
			);
		}
		return null;
	};

	return (
		<HeaderContainer { ...rest }>
			{ backLink && (
				<BackLink
					href={ backLink }
					onClick={ ( e ) => {
						if ( onBackClick ) {
							e.preventDefault();
							onBackClick( e );
						}
					} }
				>
					<ArrowLeftIcon /> { backLinkText }
				</BackLink>
			) }
			<LeftSection>
				<Title>{ title }</Title>
			</LeftSection>
			<RightSection>
				{ renderRightElement() }
				{ children }
			</RightSection>
		</HeaderContainer>
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
