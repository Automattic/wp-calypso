import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { DataViewsEmptyStateLayout } from './dataviews-empty-state-layout';

interface DataViewsErrorStateProps {
	title: string;
	onRetry: () => void;
	isRetrying?: boolean;
	isBorderless?: boolean;
}

export function DataViewsErrorState( {
	title,
	onRetry,
	isRetrying = false,
	isBorderless,
}: DataViewsErrorStateProps ) {
	return (
		<DataViewsEmptyStateLayout
			title={ title }
			description={ __( 'Something went wrong. Check your connection and try again.' ) }
			isBorderless={ isBorderless }
		>
			<Button
				__next40pxDefaultSize
				variant="secondary"
				isBusy={ isRetrying }
				disabled={ isRetrying }
				accessibleWhenDisabled
				onClick={ onRetry }
			>
				{ __( 'Try again' ) }
			</Button>
		</DataViewsEmptyStateLayout>
	);
}
