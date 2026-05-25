import './bar-list.scss';

import { Link } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { Text } from '../../../components/text';

export type BarListRow = { id: string; label: string; value: number; href?: string };

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
				const bar = (
					<div
						className="dashboard-apm-bar-list__bar"
						style={ {
							position: 'relative',
							flex: 1,
							minWidth: 0,
							height: 32,
							borderRadius: 4,
							overflow: 'hidden',
						} }
					>
						<div
							className="dashboard-apm-bar-list__bar-fill"
							style={ {
								position: 'absolute',
								insetInlineStart: 0,
								insetBlockStart: 0,
								insetBlockEnd: 0,
								width: `${ fillPercent }%`,
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
				);
				const linkedBar = row.href ? (
					<Link to={ row.href } className="dashboard-apm-bar-list__link">
						{ bar }
					</Link>
				) : (
					bar
				);
				return (
					<HStack key={ row.id } spacing={ 4 } alignment="center">
						{ linkedBar }
						<Text variant="muted" style={ { minWidth: 80, textAlign: 'end' } }>
							{ valueFormatter( row.value ) }
						</Text>
					</HStack>
				);
			} ) }
		</VStack>
	);
}
