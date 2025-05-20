import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

const sizes = {
	large: { maxWidth: '1200px' },
	small: { maxWidth: '600px' },
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
			style={ sizes[ size ] }
		>
			{ header }
			{ notices }
			<VStack spacing={ 8 } className="dashboard-page-layout__content">
				{ children }
			</VStack>
		</VStack>
	);
}

export default PageLayout;
