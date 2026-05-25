import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Text } from '../../../components/text';

export type BarListRow = { id: string; label: string; value: number };

export default function BarList( {
	rows,
	valueFormatter,
}: {
	rows: BarListRow[];
	valueFormatter: ( value: number ) => string;
} ) {
	const max = Math.max( 1, ...rows.map( ( r ) => r.value ) );

	return (
		<VStack spacing={ 3 }>
			{ rows.map( ( row ) => {
				const fillPercent = ( row.value / max ) * 100;
				return (
					<HStack key={ row.id } spacing={ 4 } alignment="center">
						<div
							style={ {
								position: 'relative',
								flex: 1,
								minWidth: 0,
								height: 32,
								borderRadius: 4,
								overflow: 'hidden',
								background:
									'color-mix(in srgb, var(--wp-admin-theme-color, #3858e9) 8%, transparent)',
							} }
						>
							<div
								style={ {
									position: 'absolute',
									insetInlineStart: 0,
									insetBlockStart: 0,
									insetBlockEnd: 0,
									width: `${ fillPercent }%`,
									background:
										'color-mix(in srgb, var(--wp-admin-theme-color, #3858e9) 32%, transparent)',
								} }
							/>
							<div
								style={ {
									position: 'absolute',
									insetBlockStart: 0,
									insetBlockEnd: 0,
									insetInlineStart: 0,
									insetInlineEnd: 0,
									paddingInline: 12,
									display: 'flex',
									alignItems: 'center',
								} }
							>
								<Text
									style={ {
										overflow: 'hidden',
										textOverflow: 'ellipsis',
										whiteSpace: 'nowrap',
										width: '100%',
									} }
								>
									{ row.label }
								</Text>
							</div>
						</div>
						<Text variant="muted" style={ { minWidth: 80, textAlign: 'end' } }>
							{ valueFormatter( row.value ) }
						</Text>
					</HStack>
				);
			} ) }
		</VStack>
	);
}
