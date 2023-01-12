import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface Props {
	levels?: number;
	labelFewer?: string;
	labelMore?: string;
}

export default function StatsHeatMapLegend( { levels = 5, labelFewer, labelMore }: Props ) {
	const translate = useTranslate();

	const items = [ ...Array( levels ).keys() ].map( ( index ) => {
		const idx = index + 1;
		return (
			<li key={ `level-${ idx }` } className={ `stats-heat-map__legend-item level-${ idx }` } />
		);
	} );

	return (
		<div className="stats-heat-map__legend">
			<span className="stats-heat-map__legend-label">
				{ labelFewer
					? labelFewer
					: translate( 'Fewer Views', {
							context: 'Legend label in stats all-time views table',
					  } ) }
			</span>
			<ul className="stats-heat-map__legend-item-list">{ items }</ul>
			<span className="stats-heat-map__legend-label">
				{ labelMore
					? labelMore
					: translate( 'More Views', {
							context: 'Legend label in stats all-time views table',
					  } ) }
			</span>
		</div>
	);
}
