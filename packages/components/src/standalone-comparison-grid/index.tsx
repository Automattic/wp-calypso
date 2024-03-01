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
	children:
		| React.ReactElement< typeof StandAloneComparisonGridColumn >
		| React.ReactElement< typeof StandAloneComparisonGridColumn >[];
}

const StandAloneComparisonGridColumn = ( {
	title,
	intro_copy,
	action,
	action_copy,
	features,
}: StandAloneComparisonGridColumn ) => {
	return (
		<div className="standalone-comparison-grid__column standalone-comparison-grid__body">
			<h2 className="standalone-comparison-grid__title">{ title }</h2>
			<p className="standalone-comparison-grid__intro">{ intro_copy }</p>
			<Button className="standalone-comparison-grid__action" variant="primary" onClick={ action }>
				{ action_copy }
			</Button>
			<ul className="standalone-comparison-grid__row-list">
				{ features.map( ( feature, index ) => (
					<li key={ `scdi_${ index }` } className="standalone-comparison-grid__row-item">
						{ feature }
					</li>
				) ) }
			</ul>
		</div>
	);
};

export { StandAloneComparisonGridColumn };

const StandAloneComparisonGrid: React.FC< StandAloneComparisonGridProps > = ( { children } ) => {
	return <div className="standalone-comparison-grid">{ children }</div>;
};

export default StandAloneComparisonGrid;
