import { Badge } from '@automattic/ui';
import { __ } from '@wordpress/i18n';
import { Valuation } from '../utils';

type StatusBadgeProps = {
	value: Valuation;
};

type BadgeType = 'default' | 'error' | 'warning' | 'success';

const getStatusInfo = ( value: Valuation ) => {
	if ( value === 'bad' ) {
		return { status: 'poor', text: __( 'Poor' ), intent: 'error' as BadgeType };
	} else if ( value === 'needsImprovement' ) {
		return { status: 'neutral', text: __( 'Needs improvement' ), intent: 'warning' as BadgeType };
	}
	return { status: 'good', text: __( 'Excellent' ), intent: 'success' as BadgeType };
};

export const StatusBadge = ( { value }: StatusBadgeProps ) => {
	const { text, intent } = getStatusInfo( value );

	return <Badge intent={ intent }>{ text }</Badge>;
};
