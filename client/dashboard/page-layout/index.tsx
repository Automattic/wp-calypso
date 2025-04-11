import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import './style.scss';

const sizes = {
	large: {
		maxWidth: '1200px',
	},
	small: {
		maxWidth: '600px',
	},
};

function PageLayout( {
	title,
	description,
	actions,
	children,
	size = 'large',
}: {
	title: string;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	children?: React.ReactNode;
	size?: 'large' | 'small';
} ) {
	return (
		<VStack spacing={ 4 } className="dashboard-page-layout" style={ sizes[ size ] }>
			<HStack justify="space-between" alignment="center">
				<Heading level={ 1 } style={ { flexShrink: 0 } }>
					{ title }
				</Heading>
				{ !! actions && (
					<HStack spacing={ 4 } justify="flex-end">
						{ actions }
					</HStack>
				) }
			</HStack>
			{ !! description && <Text>{ description } </Text> }
			{ !! children && <VStack spacing={ 4 }>{ children }</VStack> }
		</VStack>
	);
}

export default PageLayout;
