import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export function ResetViewAction( { onResetView }: { onResetView: () => void } ) {
	return (
		<Button variant="tertiary" size="compact" style={ { order: -1 } } onClick={ onResetView }>
			{ __( 'Reset view' ) }
		</Button>
	);
}
