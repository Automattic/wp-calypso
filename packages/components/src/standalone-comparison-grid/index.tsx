import { Button } from '@wordpress/components';
import './style.scss';

interface StandAloneComparisonGridColumn {
	title: string;
	rows: string[];
	intro_copy?: string;
	action_copy: string;
	action: () => void;
}

export interface StandAloneComparisonGridProps {
	columns: StandAloneComparisonGridColumn[];
}

const StandAloneComparisonGrid = ( props: StandAloneComparisonGridProps ) => {
	const { columns } = props;

	return (
		<div className="standalone-comparison-grid">
			{ columns.map( ( column, index ) => {
				return (
					<div className="standalone-comparison-grid__column" key={ `scd_${ index }` }>
						<table className="standalone-comparison-grid__body">
							<tbody>
								<tr>
									<td className="standalone-comparison-grid__title">
										<h1>{ column.title }</h1>
									</td>
								</tr>
								<tr>
									<td className="standalone-comparison-grid__intro">
										{ column.intro_copy && column.intro_copy }
									</td>
								</tr>

								<tr>
									<td className="standalone-comparison-grid__action">
										<Button variant="primary" onClick={ column.action }>
											{ column.action_copy }
										</Button>
									</td>
								</tr>

								<tr className="standalone-comparison-grid__row">
									<td>
										{ column.rows.map( ( row, index ) => {
											return (
												<div
													key={ `scdi_${ index }` }
													className="standalone-comparison-grid__row-item"
												>
													{ row }
												</div>
											);
										} ) }
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				);
			} ) }
		</div>
	);
};

export default StandAloneComparisonGrid;
