import { Badge } from '@wordpress/ui';
import { getStatusIntent, getStatusText, Valuation } from '../../utils/site-performance';

const badgeIntent = {
	error: 'high',
	warning: 'medium',
	success: 'stable',
} as const;

export const CoreMetricsStatusBadge = ( { value }: { value: Valuation } ) => {
	const text = getStatusText( value );
	const intent = badgeIntent[ getStatusIntent( value ) ];

	return <Badge intent={ intent }>{ text }</Badge>;
};
