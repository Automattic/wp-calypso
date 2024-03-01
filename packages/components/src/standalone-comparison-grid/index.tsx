import { Button } from '@wordpress/components';
import './style.scss';
import { ReactNode } from 'react';

interface StandAloneComparisonGridColumn {
	title: string;
	features: ReactNode[];
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
					<div
						className="standalone-comparison-grid__column standalone-comparison-grid__body"
						key={ `scd_${ index }` }
					>
						<h2 className="standalone-comparison-grid__title">{ column.title }</h2>
						<p className="standalone-comparison-grid__intro">{ column.intro_copy }</p>
						<Button
							className="standalone-comparison-grid__action"
							variant="primary"
							onClick={ column.action }
						>
							{ column.action_copy }
						</Button>
						<ul className="standalone-comparison-grid__row-list">
							{ column.features.map( ( feature, index ) => (
								<li key={ `scdi_${ index }` } className="standalone-comparison-grid__row-item">
									{ feature }
								</li>
							) ) }
						</ul>
					</div>
				);
			} ) }
		</div>
	);
};

export default StandAloneComparisonGrid;
