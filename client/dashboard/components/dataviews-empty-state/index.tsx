import { __experimentalVStack as VStack } from '@wordpress/components';
import ButtonGroup from '../button-group';
import './styles.scss';
import { Text } from '../text';
import type { ReactNode } from 'react';

interface DataViewsEmptyStateProps {
	actions?: ReactNode;
	description: string;
	illustration?: ReactNode;
	title: string;
}

export function DataViewsEmptyState( {
	actions,
	title,
	illustration,
	description,
}: DataViewsEmptyStateProps ) {
	return (
		<VStack spacing={ 6 } alignment="center" className="dashboard-dataviews-empty-state">
			{ illustration }
			<VStack spacing={ 2 } alignment="center">
				<div className="dashboard-dataviews-empty-state__heading">{ title }</div>
				<Text
					variant="muted"
					align="center"
					className="dashboard-dataviews-empty-state__sub-heading"
				>
					{ description }
				</Text>
			</VStack>
			{ actions && (
				<ButtonGroup justify="center" wrap>
					{ actions }
				</ButtonGroup>
			) }
		</VStack>
	);
}
