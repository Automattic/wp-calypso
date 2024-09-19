import './style.scss';
import { ReactElement, type ReactNode } from 'react';

interface StandAloneComparisonGridColumn {
	title: string;
	features: ReactNode[];
	introCopy?: string;
	controls: ReactNode;
}

interface Props {
	children: ReactElement< typeof Column > | ReactElement< typeof Column >[];
}

export const Column = ( {
	title,
	introCopy,
	controls,
	features,
}: StandAloneComparisonGridColumn ) => {
	return (
		<div className="standalone-comparison-grid__column standalone-comparison-grid__body">
			<h2 className="standalone-comparison-grid__title">{ title }</h2>
			<p className="standalone-comparison-grid__intro">{ introCopy }</p>
			{ controls }
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

export const StandAloneComparisonGrid: React.FC< Props > = ( { children } ) => {
	return <div className="standalone-comparison-grid">{ children }</div>;
};
