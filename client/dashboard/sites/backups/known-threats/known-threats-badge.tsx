import { Icon } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { caution } from '@wordpress/icons';
import { Badge } from '@wordpress/ui';

export function KnownThreatsBadge( { count }: { count: number } ) {
	return (
		<Badge intent="medium">
			<Icon icon={ caution } size={ 16 } aria-hidden="true" />
			{
				/* translators: %d is the number of known security threats in a backup */
				sprintf( __( 'Known threats (%d)' ), count )
			}
		</Badge>
	);
}
