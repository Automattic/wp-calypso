import {
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import emptyIllustration from './empty-illustration.svg';
import './styles.scss';
import type { View } from '@automattic/dataviews';
import type { ReactNode } from 'react';

interface DataViewsEmptyStateProps {
	heading: string;
	subHeading: string;
	viewType: View[ 'type' ];
	buttons?: ReactNode;
}

export function DataViewsEmptyState( {
	heading,
	subHeading,
	viewType,
	buttons,
}: DataViewsEmptyStateProps ) {
	return (
		<VStack
			spacing={ 8 }
			alignment="center"
			className={ `dashboard-dataviews-empty-state is-${ viewType }` }
		>
			<VStack spacing={ 3 } alignment="center">
				<img src={ emptyIllustration } alt="" width={ 408 } height={ 280 } />
				<VStack spacing={ 2 } alignment="center">
					<div className="dashboard-dataviews-empty-state__heading">{ heading }</div>
					<Text variant="muted" align="center">
						{ subHeading }
					</Text>
				</VStack>
			</VStack>
			{ buttons && (
				<HStack spacing={ 4 } justify="center">
					{ buttons }
				</HStack>
			) }
		</VStack>
	);
}
