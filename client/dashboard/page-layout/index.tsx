import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
	__experimentalText as Text,
} from '@wordpress/components';
import './style.scss';

function PageLayout( {
	title,
	description,
	actions,
	children,
}: {
	title: string;
	description?: React.ReactNode;
	actions?: React.ReactNode;
	children?: React.ReactNode;
} ) {
	return (
		<VStack spacing={ 4 } className="dashboard-page-layout">
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
