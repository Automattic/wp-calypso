import { Button } from '@wordpress/components';
import './style.scss';
import { ReactNode } from 'react';

interface StandAloneComparisonGridColumn {
	title: string;
	features: ReactNode[];
	introCopy?: string;
	actionCopy: string;
	action: () => void;
}

export interface StandAloneComparisonGridProps {
	children:
		| ReactElement< typeof StandAloneComparisonGridColumn >
		| React.ReactElement< typeof StandAloneComparisonGridColumn >[];
}

const StandAloneComparisonGridColumn = ( {
	title,
	introCopy,
	action,
	actionCopy,
	features,
}: StandAloneComparisonGridColumn ) => {
	return (
		<div className="standalone-comparison-grid__column standalone-comparison-grid__body">
			<h2 className="standalone-comparison-grid__title">{ title }</h2>
			<p className="standalone-comparison-grid__intro">{ introCopy }</p>
			<Button className="standalone-comparison-grid__action" variant="primary" onClick={ action }>
				{ actionCopy }
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
