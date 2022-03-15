import styled from '@emotion/styled';
import { useEffect, useRef } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { ReactNode } from 'react';
import Breadcrumb from 'calypso/components/breadcrumb';

const Header = styled.header`
	position: fixed;
	z-index: 1;
	top: var( --masterbar-height );
	left: calc( var( --sidebar-width-max ) + 1px ); // 1px is the sidebar border.
	width: calc( 100% - var( --sidebar-width-max ) - 1px ); // 1px is the sidebar border.
	padding: 0 32px;
	box-sizing: border-box;
	border-bottom: 1px solid var( --studio-gray-5 );
	background-color: var( --studio-white );

	@media ( max-width: 960px ) {
		// Account for jetpack sites with the old sidebar.
		left: calc( var( --sidebar-width-min ) + 1px ); // 1px is the sidebar border.
		width: calc( 100% - var( --sidebar-width-min ) - 1px ); // 1px is the sidebar border.
	}

	@media ( max-width: 782px ) {
		width: 100%;
		left: 0;
	}

	@media ( max-width: 660px ) {
		padding: 0 16px;
	}
`;

const Container = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	min-height: 70px;

	@media ( max-width: 660px ) {
		min-height: 60px;
	}

	.main.is-wide-layout & {
		max-width: 1040px;
		margin: auto;
	}
`;

const ActionsContainer = styled.div`
	display: flex;
	align-items: center;
`;

interface Props {
	id?: string;
	className?: string;
	children?: ReactNode;
	navigationItems: { label: string; href?: string }[];
	contentRef?: React.RefObject< HTMLElement >;
	compactBreadcrumb?: boolean;
}

const FixedNavigationHeader: React.FunctionComponent< Props > = ( props ) => {
	const { id, className, children, navigationItems, contentRef } = props;
	const actionsRef = useRef< HTMLDivElement >( null );
	const headerRef = useRef< HTMLElement >( null );
	const translate = useTranslate();

	useEffect( () => {
		if ( ! contentRef ) {
			return;
		}

		const handleScroll = () => {
			const headerHeight = headerRef?.current?.getBoundingClientRect().height;
			const offset =
				contentRef.current && headerHeight ? contentRef.current.offsetTop - headerHeight : 0;
			const scrollPosition = window.scrollY;
			const actionElement = actionsRef?.current;

			if ( ! actionElement ) {
				return;
			}

			if ( offset > 0 && scrollPosition < offset ) {
				actionElement.style.visibility = 'hidden';
			} else {
				actionElement.style.visibility = 'visible';
			}
		};

		handleScroll();

		window.addEventListener( 'scroll', handleScroll );
		return () => {
			window.removeEventListener( 'scroll', handleScroll );
		};
	}, [ contentRef ] );

	let mobileItem: { label: React.ReactChild; href?: string; showBackArrow?: boolean } = {
		label: translate( 'Back' ),
	};
	if ( navigationItems.length > 1 ) {
		mobileItem = {
			href: navigationItems[ navigationItems.length - 2 ].href,
			label: translate( 'Back' ),
			showBackArrow: true,
		};
		navigationItems[ navigationItems.length - 1 ].href = undefined;
	} else if ( navigationItems.length > 0 ) {
		mobileItem = { ...navigationItems[ 0 ], showBackArrow: false };
	}

	return (
		<Header id={ id } className={ className } ref={ headerRef }>
			<Container>
				<Breadcrumb items={ navigationItems } mobileItem={ mobileItem } />
				<ActionsContainer ref={ actionsRef }>{ children }</ActionsContainer>
			</Container>
		</Header>
	);
};

FixedNavigationHeader.defaultProps = {
	id: '',
	className: '',
	navigationItems: [],
};

export default FixedNavigationHeader;
