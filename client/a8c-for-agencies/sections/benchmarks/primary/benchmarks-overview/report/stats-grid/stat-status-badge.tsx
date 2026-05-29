import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

export type BadgeKind = 'better' | 'at' | 'below';

type Props = {
	kind: BadgeKind;
};

function getLabel( kind: BadgeKind ): string {
	if ( kind === 'better' ) {
		return __( 'Better than median' );
	}
	if ( kind === 'below' ) {
		return __( 'Below median' );
	}
	return __( 'At median' );
}

export default function StatStatusBadge( { kind }: Props ) {
	return (
		<span className={ clsx( 'benchmarks-stat-status-badge', `is-${ kind }` ) }>
			{ getLabel( kind ) }
		</span>
	);
}
