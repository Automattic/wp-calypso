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

/**
 * Notices a host shows on every page it wraps, such as an account-level
 * banner. PageLayout renders them only on pages that pass no `notices` of
 * their own; a page that does owns the slot.
 */
const PageNoticesContext = createContext< React.ReactNode >( null );

export function PageNoticesProvider( {
	children,
	notices,
}: {
	children: React.ReactNode;
	notices?: React.ReactNode;
} ) {
	return <PageNoticesContext.Provider value={ notices }>{ children }</PageNoticesContext.Provider>;
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
	const hostNotices = useContext( PageNoticesContext );

	return (
		<VStack
			spacing="var(--dashboard-page-header__content-gap)"
			className={ `dashboard-page-layout is-${ size }` }
			style={ PAGE_LAYOUT_SIZES[ size ] as CSSProperties }
		>
			{ header }
			{ subNav }
			{ notices ?? hostNotices }
			<VStack spacing={ 6 } className="dashboard-page-layout__content">
				{ /* A PageLayout nested in this one must not repeat the host notices. */ }
				<PageNoticesContext.Provider value={ null }>{ children }</PageNoticesContext.Provider>
			</VStack>
		</VStack>
	);
}

export default PageLayout;
