import styled from '@emotion/styled';
import clsx from 'clsx';
import React, { ReactNode, useEffect, useState } from 'react';
import Breadcrumb, { Item as TBreadcrumbItem } from 'calypso/components/breadcrumb';
import FormattedHeader from 'calypso/components/formatted-header';
import ScreenOptionsTab from 'calypso/components/screen-options-tab';

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
	alwaysShowTitle?: boolean;
	screenReader?: string | ReactNode;
	screenOptionsTab?: string;
	style?: object;
	loggedIn?: boolean;
}

// This function checks if the URL contains the 'options' query parameter and if it includes 'noCrumbs'.
// Expired eCommerce trials use this to hide the breadcrumbs since those users can't access settings and other pages exposed in the breadcrumbs.
export const checkShouldShowBreadcrumb = (): boolean => {
	if ( typeof window === 'undefined' ) {
		return false;
	}

	try {
		const params = new URLSearchParams( window.location.search );
		const options = params.get( 'options' ) || '';
		return ! options.includes( 'noCrumbs' );
	} catch {
		return false;
	}
};

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
		alwaysShowTitle = false,
		screenReader,
		screenOptionsTab,
		loggedIn = true,
	} = props;

	const [ showCrumbs, setShowCrumbs ] = useState( false );
	const showTitle = alwaysShowTitle || ( navigationItems.length < 2 && loggedIn );

	useEffect( () => {
		setShowCrumbs( checkShouldShowBreadcrumb() );
	}, [] );

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
					{ showCrumbs && (
						<Breadcrumb
							items={ navigationItems }
							mobileItem={ mobileItem }
							compact={ compactBreadcrumb }
							hideWhenOnlyOneLevel
						/>
					) }
					{ showTitle && (
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

NavigationHeader.displayName = 'NavigationHeader';

NavigationHeader.defaultProps = {
	id: '',
	className: '',
};

export default NavigationHeader;
