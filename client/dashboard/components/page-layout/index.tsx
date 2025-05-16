import { __experimentalVStack as VStack } from '@wordpress/components';
import './style.scss';

const sizes = {
	large: { maxWidth: '1200px' },
	small: { maxWidth: '600px' },
};

function PageLayout( {
	children,
	size = 'large',
}: {
	children?: React.ReactNode;
	size?: 'large' | 'small';
} ) {
	return (
		<VStack spacing={ 8 } className="dashboard-page-layout" style={ sizes[ size ] }>
			{ children }
		</VStack>
	);
}

export default PageLayout;
