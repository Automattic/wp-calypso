import { __experimentalVStack as VStack } from '@wordpress/components';
import type { CSSProperties } from 'react';
import './style.scss';

const PAGE_LAYOUT_SIZES = {
	large: { '--page-layout-max-width': '1344px' },
	small: { '--page-layout-max-width': '660px' },
};

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
	return (
		<VStack
			spacing={ 8 }
			className={ `dashboard-page-layout is-${ size }` }
			style={ PAGE_LAYOUT_SIZES[ size ] as CSSProperties }
		>
			{ header }
			{ notices }
			<VStack spacing={ 6 } className="dashboard-page-layout__content">
				{ children }
			</VStack>
		</VStack>
	);
}

export default PageLayout;
