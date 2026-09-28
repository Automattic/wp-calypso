import { __experimentalVStack as VStack } from '@wordpress/components';
import { createContext, useContext } from 'react';
import type { CSSProperties } from 'react';
import './style.scss';

const PAGE_LAYOUT_SIZES = {
	large: { '--page-layout-max-width': '1344px' },
	small: { '--page-layout-max-width': '660px' },
};

/**
 * Navigation owned by a host that embeds these screens in chrome of its own.
 * PageLayout renders it directly below the page header, so tabs the host
 * provides sit with the page they switch between rather than above its title.
 */
const PageSubNavContext = createContext< React.ReactNode >( null );

export function PageSubNavProvider( {
	children,
	subNav,
}: {
	children: React.ReactNode;
	subNav?: React.ReactNode;
} ) {
	return <PageSubNavContext.Provider value={ subNav }>{ children }</PageSubNavContext.Provider>;
}

function PageLayout( {
	children,
	header,
	notices,
	size = 'large',
}: {
	children?: React.ReactNode;
	header?: React.ReactNode;
	notices?: React.ReactNode;
	size?: 'large' | 'small';
} ) {
	const subNav = useContext( PageSubNavContext );

	return (
		<VStack
			spacing="var(--dashboard-page-header__content-gap)"
			className={ `dashboard-page-layout is-${ size }` }
			style={ PAGE_LAYOUT_SIZES[ size ] as CSSProperties }
		>
			{ header }
			{ subNav }
			{ notices }
			<VStack spacing={ 6 } className="dashboard-page-layout__content">
				{ children }
			</VStack>
		</VStack>
	);
}

export default PageLayout;
