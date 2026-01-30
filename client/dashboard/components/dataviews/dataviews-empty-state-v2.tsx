import EmptyState from '../../components/empty-state';
import type { ReactNode } from 'react';

interface DataViewsEmptyStateV2Props {
	title: string;
	description: string;
	children?: ReactNode;
	isBorderless?: boolean;
	context: 'sites' | 'domains' | 'emails';
}

export function DataViewsEmptyStateV2( {
	title,
	description,
	isBorderless,
	children,
}: DataViewsEmptyStateV2Props ) {
	return (
		<EmptyState.Wrapper isBorderless={ isBorderless }>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ title }</EmptyState.Title>
					<EmptyState.Description>{ description }</EmptyState.Description>
				</EmptyState.Header>
				<EmptyState.Content>{ children }</EmptyState.Content>
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
