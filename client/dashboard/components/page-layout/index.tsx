import { __experimentalVStack as VStack } from '@wordpress/components';
import { CalloutOverlay } from '../callout-overlay';
import './style.scss';

const sizes = {
	large: { maxWidth: '1200px' },
	small: { maxWidth: '600px' },
};

function PageLayout( {
	callout,
	children,
	header,
	notices,
	size = 'large',
}: {
	callout?: React.ReactNode;
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
			<CalloutOverlay
				showCallout={ !! callout }
				callout={ callout }
				main={
					<>
						{ header }
						{ notices }
						<VStack spacing={ 6 } className="dashboard-page-layout__content">
							{ children }
						</VStack>
					</>
				}
			/>
		</VStack>
	);
}

export default PageLayout;
