import styled from '@emotion/styled';
import clsx from 'clsx';
import React, { ReactNode } from 'react';
import Breadcrumb, { Item as TBreadcrumbItem } from 'calypso/components/breadcrumb';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';
import FormattedHeader from '../formatted-header';

import './style.scss';

const Container = styled.div`
	.main.is-wide-layout & {
		margin: auto;
	}

	.stats &,
	.stats__email-detail & {
		max-width: 1224px;
		margin: auto;
	}
`;

interface Props {
	id?: string;
	className?: string;
	children?: ReactNode;
	navigationItems?: TBreadcrumbItem[];
	mobileItem?: TBreadcrumbItem;
	compactBreadcrumb?: boolean;
	title?: string | ReactNode;
	subtitle?: string | ReactNode;
	screenReader?: string | ReactNode;
	screenOptionsTab?: string;
	style?: object;
}

const NavigationHeader = React.forwardRef< HTMLElement, Props >( ( props, ref ) => {
	const {
		id,
		className,
		style,
		children,
		navigationItems = [],
		mobileItem,
		compactBreadcrumb,
		title,
		subtitle,
		screenReader,
		screenOptionsTab,
	} = props;
	return (
		<header
			id={ id }
			className={ clsx(
				className,
				'navigation-header',
				screenOptionsTab && children ? 'navigation-header__screen-options-tab' : ''
			) }
			style={ style }
			ref={ ref }
		>
			<Container>
				<div className="navigation-header__main">
					{ screenOptionsTab && <ScreenOptionsTab wpAdminPath={ screenOptionsTab } /> }
					<Breadcrumb
						items={ navigationItems }
						mobileItem={ mobileItem }
						compact={ compactBreadcrumb }
						hideWhenOnlyOneLevel
					/>
					{ navigationItems.length < 2 && (
						<FormattedHeader
							align="left"
							headerText={ title }
							subHeaderText={ subtitle }
							screenReader={ screenReader }
						/>
					) }
					<div className="navigation-header__actions">{ children }</div>
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
