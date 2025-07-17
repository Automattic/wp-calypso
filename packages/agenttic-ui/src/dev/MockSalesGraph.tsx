import React from 'react';

interface SalesData {
	product: string;
	sales: number;
}

interface MockSalesGraphProps {
	title: string;
	data: SalesData[];
	timeframe?: string;
}

export const MockSalesGraph: React.FC< MockSalesGraphProps > = ( {
	title,
	data,
	timeframe,
} ) => {
	const maxSales = Math.max( ...data.map( ( item ) => item.sales ) );
	const colors = [
		'#3B82F6', // blue
		'#10B981', // emerald
		'#8B5CF6', // purple
		'#F59E0B', // orange
		'#EC4899', // pink
		'#6366F1', // indigo
		'#14B8A6', // teal
	];

	return (
		<div
			className="bg-white border rounded-xl p-6 shadow-xs"
			style={ {
				maxWidth: '600px',
				background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
				margin: '16px 0',
				padding: '12px',
			} }
		>
			{ /* Header */ }
			<div style={ { marginBottom: '24px' } }>
				<div
					className="flex items-center gap-2"
					style={ { marginBottom: '8px' } }
				>
					<div
						className="rounded-full"
						style={ {
							width: '12px',
							height: '12px',
							background:
								'linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)',
						} }
					></div>
					<h3
						className="text-base font-medium"
						style={ {
							fontSize: '20px',
							fontWeight: '700',
							color: '#1f2937',
						} }
					>
						{ title }
					</h3>
				</div>
				{ timeframe && (
					<p
						className="text-sm inline-block px-3 py-1 rounded-full"
						style={ {
							color: '#6b7280',
							backgroundColor: '#f3f4f6',
							fontSize: '14px',
						} }
					>
						📅 { timeframe }
					</p>
				) }
			</div>

			{ /* Chart */ }
			<div style={ { marginBottom: '24px' } }>
				{ data.map( ( item, index ) => {
					const percentage = ( item.sales / maxSales ) * 100;
					const color = colors[ index % colors.length ];

					return (
						<div key={ index } style={ { marginBottom: '16px' } }>
							<div
								className="flex items-center justify-between"
								style={ { marginBottom: '8px' } }
							>
								<div className="flex items-center gap-2">
									<div
										className="rounded-full"
										style={ {
											width: '12px',
											height: '12px',
											backgroundColor: color,
										} }
									></div>
									<span
										className="font-medium"
										style={ {
											color: '#1f2937',
											fontWeight: '500',
										} }
									>
										{ item.product }
									</span>
								</div>
								<span
									className="text-sm font-medium"
									style={ {
										color: '#6b7280',
										fontWeight: '600',
									} }
								>
									{ item.sales.toLocaleString() }
								</span>
							</div>
							<div
								className="w-full rounded-full overflow-hidden"
								style={ {
									height: '16px',
									backgroundColor: '#e5e7eb',
								} }
							>
								<div
									className="rounded-full transition-all"
									style={ {
										height: '16px',
										width: `${ percentage }%`,
										backgroundColor: color,
										background: `linear-gradient(90deg, ${ color } 0%, ${ color }CC 100%)`,
										boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
										animation: `fillBar-${ index } 1s ease-out ${
											index * 0.1
										}s both`,
									} }
								></div>
							</div>
							<div
								className="text-xs"
								style={ {
									color: '#9ca3af',
									marginTop: '4px',
									marginLeft: '20px',
								} }
							>
								{ percentage.toFixed( 1 ) }% of top performer
							</div>
						</div>
					);
				} ) }
			</div>

			{ /* Footer Stats */ }
			<div className="border-t pt-4" style={ { borderColor: '#e5e7eb' } }>
				<div className="flex gap-4">
					<div
						className="flex-1 rounded-lg p-3"
						style={ {
							backgroundColor: '#eff6ff',
							textAlign: 'center',
						} }
					>
						<div
							style={ {
								fontSize: '24px',
								fontWeight: '700',
								color: '#2563eb',
							} }
						>
							{ data
								.reduce( ( sum, item ) => sum + item.sales, 0 )
								.toLocaleString() }
						</div>
						<div
							className="text-xs font-medium"
							style={ { color: '#2563eb' } }
						>
							Total Sales
						</div>
					</div>
					<div
						className="flex-1 rounded-lg p-3"
						style={ {
							backgroundColor: '#ecfdf5',
							textAlign: 'center',
						} }
					>
						<div
							style={ {
								fontSize: '24px',
								fontWeight: '700',
								color: '#059669',
							} }
						>
							{ Math.round(
								data.reduce(
									( sum, item ) => sum + item.sales,
									0
								) / data.length
							).toLocaleString() }
						</div>
						<div
							className="text-xs font-medium"
							style={ { color: '#059669' } }
						>
							Avg per Product
						</div>
					</div>
				</div>
			</div>

			{ /* CSS Animations */ }
			<style>{ `
				${ data
					.map(
						( _, index ) => `
					@keyframes fillBar-${ index } {
						from { width: 0%; }
						to { width: ${ ( data[ index ].sales / maxSales ) * 100 }%; }
					}
				`
					)
					.join( '' ) }
			` }</style>
		</div>
	);
};
