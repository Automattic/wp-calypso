import { Icon, VisuallyHidden } from '@wordpress/components';
import { __, _n, sprintf } from '@wordpress/i18n';
import { caution } from '@wordpress/icons';
import './known-threats-badge.scss';

export function getKnownThreatsWarning( count: number ) {
	return sprintf(
		// translators: %d is the number of known security threats in the backup
		_n(
			'This backup contains %d known security threat and may restore malware on your site.',
			'This backup contains %d known security threats and may restore malware on your site.',
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
