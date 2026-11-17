import EmptyState from '../empty-state';
import type { ReactNode } from 'react';

interface DataViewsEmptyStateLayoutProps {
	title: string;
	description: ReactNode;
	children?: ReactNode;
	isBorderless?: boolean;
	/**
	 * Renders a card that is only as tall as its content, for screens where
	 * the empty state should not fill the page.
	 */
	isCompact?: boolean;
}

export function DataViewsEmptyStateLayout( {
	title,
	description,
	isBorderless,
	isCompact,
	children,
}: DataViewsEmptyStateLayoutProps ) {
	return (
		<EmptyState.Wrapper isBorderless={ isBorderless } isCompact={ isCompact }>
			<EmptyState>
				<EmptyState.Header>
					<EmptyState.Title>{ title }</EmptyState.Title>
					<EmptyState.Description>{ description }</EmptyState.Description>
				</EmptyState.Header>
				{ ( ! isCompact || !! children ) && <EmptyState.Content>{ children }</EmptyState.Content> }
			</EmptyState>
		</EmptyState.Wrapper>
	);
}
