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
		<VStack spacing={ 8 } className="dashboard-page-layout" style={ sizes[ size ] }>
			<VStack spacing={ 4 }>
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
				{ !! description && (
					<Text className="dasboard-page-layout__description">{ description } </Text>
				) }
			</VStack>
			{ !! children && <VStack spacing={ 8 }>{ children }</VStack> }
		</VStack>
	);
}

export default PageLayout;
