import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

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
		<VStack spacing={ 8 } className={ `dashboard-page-layout is-${ size }` }>
			{ header }
			{ notices }
			<VStack spacing={ 6 } className="dashboard-page-layout__content">
				{ children }
			</VStack>
		</VStack>
	);
}

export default PageLayout;
