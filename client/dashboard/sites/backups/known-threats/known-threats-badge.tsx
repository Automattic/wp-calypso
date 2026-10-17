import { Button, Icon, Tooltip } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { caution } from '@wordpress/icons';
import './known-threats-badge.scss';

export function KnownThreatsBadge( { count }: { count: number } ) {
	return (
		<span className="dashboard-known-threats-badge">
			<Icon icon={ caution } size={ 16 } fill="currentColor" aria-hidden="true" />
			{
				/* translators: %d is the number of known security threats in a backup */
				sprintf( __( 'Known threats (%d)' ), count )
			}
		</span>
	);
}

interface KnownThreatsToggleProps {
	count: number;
	isOpen: boolean;
	onToggle: () => void;
}

export function KnownThreatsToggle( { count, isOpen, onToggle }: KnownThreatsToggleProps ) {
	const actionLabel = isOpen ? __( 'Hide threats' ) : __( 'Show threats' );
	const ariaLabel = isOpen
		? /* translators: %d is the number of known security threats in a backup; the button hides the list of threats */
			sprintf( __( 'Known threats (%d), hide threats' ), count )
		: /* translators: %d is the number of known security threats in a backup; the button shows the list of threats */
			sprintf( __( 'Known threats (%d), show threats' ), count );

	return (
		<Tooltip text={ actionLabel }>
			<Button
				__next40pxDefaultSize
				variant="tertiary"
				size="compact"
				className="dashboard-known-threats-toggle"
				aria-label={ ariaLabel }
				aria-expanded={ isOpen }
				onClick={ onToggle }
			>
				<KnownThreatsBadge count={ count } />
			</Button>
		</Tooltip>
	);
}
