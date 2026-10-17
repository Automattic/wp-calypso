import { __, sprintf } from '@wordpress/i18n';
import { Badge } from '@wordpress/ui';

export function KnownThreatsBadge( { count }: { count: number } ) {
	return (
		<Badge intent="medium">
			{
				/* translators: %d is the number of known security threats in a backup */
				sprintf( __( 'Known threats (%d)' ), count )
			}
		</Badge>
	);
}
