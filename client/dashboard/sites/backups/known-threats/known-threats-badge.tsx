import { Button, Icon, VisuallyHidden } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { caution, chevronDown, chevronUp } from '@wordpress/icons';
import './known-threats-badge.scss';

export function getKnownThreatsWarning( count: number ) {
	return sprintf(
		// translators: %d is the number of known security threats in the backup
		_n(
			'This backup is known to contain %d security threat. Restoring it may bring malware back to your site.',
			'This backup is known to contain %d security threats. Restoring it may bring malware back to your site.',
			count
		),
		count
	);
}

interface KnownThreatsBadgeProps {
	count: number;
	/**
	 * Explain the badge to screen readers, where the warning isn't shown nearby. Not in a tooltip:
	 * a badge isn't interactive, and tooltips are for labels, not descriptions.
	 */
	showWarning?: boolean;
}

export function KnownThreatsBadge( { count, showWarning = false }: KnownThreatsBadgeProps ) {
	const badge = (
		<span className="dashboard-known-threats-badge">
			<Icon icon={ caution } size={ 16 } fill="currentColor" aria-hidden="true" />
			{
				/* translators: %d is the number of known security threats in a backup */
				sprintf( __( 'Known threats (%d)' ), count )
			}
		</span>
	);

	if ( ! showWarning ) {
		return badge;
	}

	return (
		<>
			{ badge }
			<VisuallyHidden as="span">{ getKnownThreatsWarning( count ) }</VisuallyHidden>
		</>
	);
}

interface KnownThreatsToggleProps {
	isOpen: boolean;
	onToggle: () => void;
	/** The id of the region the toggle shows; referenced only while it is open. */
	controlsId?: string;
}

export function KnownThreatsToggle( { isOpen, onToggle, controlsId }: KnownThreatsToggleProps ) {
	// The warning beside it already gives the count, so no badge: just the button.
	return (
		<Button
			__next40pxDefaultSize
			variant="secondary"
			size="compact"
			icon={ isOpen ? chevronUp : chevronDown }
			iconPosition="right"
			aria-expanded={ isOpen }
			aria-controls={ isOpen ? controlsId : undefined }
			onClick={ onToggle }
		>
			{ isOpen
				? /* translators: Hides the list of known security threats in a backup. */
					__( 'Hide threats' )
				: /* translators: Shows the list of known security threats in a backup. */
					__( 'Show threats' ) }
		</Button>
	);
}
