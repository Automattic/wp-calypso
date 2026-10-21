import { Button, Icon, Tooltip, VisuallyHidden } from '@wordpress/components';
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
	/** Explain the badge in a tooltip and to screen readers, where the warning isn't shown nearby. */
	showWarning?: boolean;
	/** Set to false where the tooltip can't be reached, e.g. under a clickable row. */
	withTooltip?: boolean;
}

export function KnownThreatsBadge( {
	count,
	showWarning = false,
	withTooltip = true,
}: KnownThreatsBadgeProps ) {
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

	const warning = getKnownThreatsWarning( count );
	return (
		<>
			{ withTooltip ? <Tooltip text={ warning }>{ badge }</Tooltip> : badge }
			<VisuallyHidden as="span">{ warning }</VisuallyHidden>
		</>
	);
}

interface KnownThreatsToggleProps {
	count: number;
	isOpen: boolean;
	onToggle: () => void;
	/** The id of the region the toggle shows; referenced only while it is open. */
	controlsId?: string;
}

export function KnownThreatsToggle( {
	count,
	isOpen,
	onToggle,
	controlsId,
}: KnownThreatsToggleProps ) {
	const ariaLabel = isOpen
		? /* translators: %d is the number of known security threats in a backup; the button hides the list of threats */
			sprintf( __( 'Known threats (%d), hide threats' ), count )
		: /* translators: %d is the number of known security threats in a backup; the button shows the list of threats */
			sprintf( __( 'Known threats (%d), show threats' ), count );

	// No tooltip: it could only repeat the label.
	return (
		<Button
			__next40pxDefaultSize
			variant="tertiary"
			size="compact"
			className="dashboard-known-threats-toggle"
			aria-label={ ariaLabel }
			aria-expanded={ isOpen }
			aria-controls={ isOpen ? controlsId : undefined }
			onClick={ onToggle }
		>
			<KnownThreatsBadge count={ count } />
			<Icon icon={ isOpen ? chevronUp : chevronDown } size={ 24 } />
		</Button>
	);
}
