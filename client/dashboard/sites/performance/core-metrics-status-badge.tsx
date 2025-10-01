import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';
import { Valuation } from '../../utils/site-performance';

type BadgeType = 'default' | 'error' | 'warning' | 'success';

export const CoreMetricsStatusBadge = ( { value }: { value: Valuation } ) => {
	const statusMap: Record< Valuation, { text: string; intent: BadgeType } > = {
		bad: { text: __( 'Poor' ), intent: 'error' },
		needsImprovement: { text: __( 'Needs improvement' ), intent: 'warning' },
		good: { text: __( 'Excellent' ), intent: 'success' },
	};

	const { text, intent } = statusMap[ value ];

	return <Badge intent={ intent }>{ text }</Badge>;
};
