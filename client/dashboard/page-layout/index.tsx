import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalHeading as Heading,
} from '@wordpress/components';
import './style.scss';

function PageLayout( {
	title,
	actions,
	children,
}: {
	title: string;
	actions?: React.ReactNode;
	children: React.ReactNode;
} ) {
	return (
		<VStack spacing={ 4 } className="dashboard-page-layout">
			<HStack justify="space-between" alignment="center">
				<Heading level={ 1 }>{ title }</Heading>
				<HStack spacing={ 1 } justify="flex-end">
					{ actions }
				</HStack>
			</HStack>
			<div>{ children }</div>
		</VStack>
	);
}

export default PageLayout;
