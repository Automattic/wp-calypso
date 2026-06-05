import { Badge } from '@wordpress/ui';
import { getStatusIntent, getStatusText, Valuation } from '../../utils/site-performance';

export const CoreMetricsStatusBadge = ( { value }: { value: Valuation } ) => {
	const text = getStatusText( value );
	const intent = getStatusIntent( value );

	return <Badge intent={ intent }>{ text }</Badge>;
};
