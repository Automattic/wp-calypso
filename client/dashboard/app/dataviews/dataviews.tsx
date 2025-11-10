import { Button } from '@wordpress/components';
import { DataViews as WPDataViews } from '@wordpress/dataviews';
import { __ } from '@wordpress/i18n';
import { sanitizeView } from './sanitize-view';
import type { ComponentProps } from 'react';

type WPDataViewsProps< Item > = ComponentProps< typeof WPDataViews< Item > >;

export type DataViewsProps< Item > = WPDataViewsProps< Item > & {
	onResetView?: () => void;
};

export function DataViews< Item >( { view, onResetView, ...props }: DataViewsProps< Item > ) {
	const sanitizedView = sanitizeView( view, props.fields );

	// TODO: apply local styles if necessary.
	return (
		<WPDataViews< Item >
			view={ sanitizedView }
			header={
				onResetView && (
					<Button variant="tertiary" size="compact" style={ { order: -1 } } onClick={ onResetView }>
						{ __( 'Reset view' ) }
					</Button>
				)
			}
			{ ...( props as any ) }
		/>
	);
}
