import styled from '@emotion/styled';
import React, { ReactNode } from 'react';
import Breadcrumb, { Item as TBreadcrumbItem } from 'calypso/components/breadcrumb';
import FormattedHeader from '../formatted-header';

import './style.scss';

const Container = styled.div`
	@media ( max-width: 660px ) {
		min-height: 60px;
	}

	.main.is-wide-layout & {
		max-width: 1040px;
		margin: auto;
	}

	.stats &,
	.stats__email-detail & {
		max-width: 1224px;
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
	navigationItems: TBreadcrumbItem[];
	mobileItem?: TBreadcrumbItem;
	compactBreadcrumb?: boolean;
	title?: string | ReactNode;
	subtitle?: string | ReactNode;
}

const NavigationHeader = React.forwardRef< HTMLElement, Props >( ( props, ref ) => {
	const {
		id,
		className,
		children,
		navigationItems,
		mobileItem,
		compactBreadcrumb,
		title,
		subtitle,
	} = props;
	return (
		<header id={ id } className={ 'navigation-header ' + className } ref={ ref }>
			<Container>
				<Breadcrumb
					items={ navigationItems }
					mobileItem={ mobileItem }
					compact={ compactBreadcrumb }
					hideWhenOnlyOneLevel
				/>
				<div className="navigation-header__main">
					<FormattedHeader align="left" headerText={ title } subHeaderText={ subtitle } />
					<ActionsContainer>{ children }</ActionsContainer>
				</div>
			</Container>
		</header>
	);
} );

NavigationHeader.defaultProps = {
	id: '',
	className: '',
};

export default NavigationHeader;
