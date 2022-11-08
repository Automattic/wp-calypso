import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import Breadcrumb, { Item as TBreadcrumbItem } from 'calypso/components/breadcrumb';

const Header = styled.header`
	position: fixed;
	z-index: 10;
	top: var( --masterbar-height );
	left: 0;
	padding: 0 32px;
	box-sizing: border-box;
	width: 100%;
	border-bottom: 1px solid var( --studio-gray-5 );
	background-color: var( --studio-white );

	.layout__secondary ~ .layout__primary & {
		left: calc( var( --sidebar-width-max ) + 1px ); // 1px is the sidebar border.
		width: calc( 100% - var( --sidebar-width-max ) - 1px ); // 1px is the sidebar border.

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

const ColContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: stretch;
	min-height: 70px;

	@media ( max-width: 660px ) {
		min-height: 60px;
	}

	.main.is-wide-layout & {
		max-width: 1040px;
		margin: auto;
	}

	& > *:first-child:not( :only-child ) {
		margin-top: 24px;
	}
`;

const RowContainer = styled.div`
	margin: 24px 0 0;
	display: flex;
	justify-content: space-between;
	align-items: center;

	&:only-child {
		margin-top: 0;
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
	navigationItems: TBreadcrumbItem[];
	mobileItem?: TBreadcrumbItem;
	compactBreadcrumb?: boolean;
	headerNode?: ReactNode;
	tabListNode?: ReactNode;
}

const FixedNavigationHeader = React.forwardRef< HTMLElement, Props >( ( props, ref ) => {
	const {
		id,
		className,
		children,
		navigationItems,
		mobileItem,
		compactBreadcrumb,
		headerNode,
		tabListNode,
	} = props;
	return (
		<Header id={ id } className={ 'fixed-navigation-header__header ' + className } ref={ ref }>
			{ ! headerNode && (
				<Container>
					<Breadcrumb
						items={ navigationItems }
						mobileItem={ mobileItem }
						compact={ compactBreadcrumb }
					/>
					<ActionsContainer>{ children }</ActionsContainer>
				</Container>
			) }
			{ headerNode && (
				<ColContainer>
					<Breadcrumb
						items={ navigationItems }
						mobileItem={ mobileItem }
						compact={ compactBreadcrumb }
					/>

					<RowContainer>
						{ headerNode }
						<ActionsContainer>{ children }</ActionsContainer>
					</RowContainer>
					{ tabListNode }
				</ColContainer>
			) }
		</Header>
	);
} );

FixedNavigationHeader.defaultProps = {
	id: '',
	className: '',
};

export default FixedNavigationHeader;
