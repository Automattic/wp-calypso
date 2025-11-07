import { Badge } from '@automattic/ui';

export const getSeverityIntent = ( severity: number ): 'default' | 'error' | 'warning' => {
	if ( severity >= 5 ) {
		return 'error';
	}
	if ( severity >= 4 ) {
		return 'warning';
	}
	return 'default';
};

export const SeverityBadge = ( {
	severity,
	severityLabel,
}: {
	severity: number;
	severityLabel: string;
} ) => {
	const intent = getSeverityIntent( severity );
	return (
		<Badge intent={ intent } style={ { flexShrink: 0 } }>
			{ severityLabel }
		</Badge>
	);
};
