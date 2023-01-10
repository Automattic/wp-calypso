import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface Props {
	levels?: number;
}

export default function StatsHeatMapLegends( { levels = 5 }: Props ) {
	const translate = useTranslate();

	const items = [ ...Array( levels ).keys() ].map( ( index ) => {
		const idx = index + 1;
		return (
			<li key={ `level-${ idx }` } className={ `stats-heat-map__legends-item level-${ idx }` } />
		);
	} );

	return (
		<div className="stats-heat-map__legends">
			<span className="stats-heat-map__legends-label">
				{ translate( 'Fewer Views', {
					context: 'Legend label in stats all-time views table',
				} ) }
			</span>
			<ul className="stats-heat-map__legends-item-list">{ items }</ul>
			<span className="stats-heat-map__legends-label">
				{ translate( 'More Views', {
					context: 'Legend label in stats all-time views table',
				} ) }
			</span>
		</div>
	);
}
