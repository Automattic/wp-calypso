import { __experimentalHStack as HStack, __experimentalText as Text } from '@wordpress/components';
import type { ApmTransaction, ApmTransactionType } from '@automattic/api-core';

const COLORS: Record< ApmTransactionType, string > = {
	db: '#3858E9',
	wp_core: '#117AC9',
	plugin: '#7B5EA7',
	external: '#D67709',
};

function formatMs( ms: number ): string {
	if ( ms >= 1000 ) {
		return `${ ( ms / 1000 ).toFixed( 2 ) } s`;
	}
	return `${ ms } ms`;
}

export default function TransactionsWaterfall( {
	transactions,
	totalMs,
}: {
	transactions: ApmTransaction[];
	totalMs: number;
} ) {
	if ( totalMs <= 0 ) {
		return null;
	}
	return (
		<div style={ { display: 'flex', flexDirection: 'column', gap: 8 } }>
			{ transactions.map( ( t, idx ) => {
				const leftPct = ( t.start_offset_ms / totalMs ) * 100;
				const widthPct = Math.max( ( t.duration_ms / totalMs ) * 100, 0.5 );
				return (
					<HStack key={ idx } spacing={ 4 } alignment="center">
						<div style={ { flex: '0 0 35%', minWidth: 0 } }>
							<Text truncate>{ t.name }</Text>
						</div>
						<div
							style={ {
								flex: '1 1 auto',
								position: 'relative',
								height: 16,
								background: 'var(--dashboard__background-color, #f0f0f0)',
								borderRadius: 2,
							} }
						>
							<div
								style={ {
									position: 'absolute',
									insetInlineStart: `${ leftPct }%`,
									width: `${ widthPct }%`,
									top: 0,
									bottom: 0,
									background: COLORS[ t.type ],
									borderRadius: 2,
								} }
								title={ `${ t.name } — ${ formatMs( t.duration_ms ) }` }
							/>
						</div>
						<div style={ { flex: '0 0 80px', textAlign: 'end' } }>
							<Text variant="muted">{ formatMs( t.duration_ms ) }</Text>
						</div>
					</HStack>
				);
			} ) }
		</div>
	);
}
