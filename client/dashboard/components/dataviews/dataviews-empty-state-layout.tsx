import EmptyState from '../empty-state';
import type { ReactNode } from 'react';

interface DataViewsEmptyStateLayoutProps {
	title: string;
	description: ReactNode;
	children?: ReactNode;
	isBorderless?: boolean;
}

export function DataViewsEmptyStateLayout( {
	title,
	description,
	isBorderless,
	children,
}: DataViewsEmptyStateLayoutProps ) {
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
