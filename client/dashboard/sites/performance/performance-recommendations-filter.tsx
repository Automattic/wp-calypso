import { Card, CardBody, SelectDropdown } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

interface PerformancePageLoadTimelineCardProps {
	recommendations: any[];
}

export function PerformancePageLoadTimelineCard( {
	screenshots,
}: PerformancePageLoadTimelineCardProps ) {
	return (
		<Card>
			<CardBody>
				<div>{ __( 'Recommendations' ) }</div>
				<SelectDropdown
					value={ selectedFilter }
					initialSelected={ selectedFilter }
					onSelect={ onFilter }
					selectedText={
						selectedFilter === 'all'
							? translate( 'All recommendations' )
							: metricsNames[ selectedFilter as keyof typeof metricsNames ]?.name
					}
					selectedCount={ filteredAudits.length }
					options={ [
						{ label: 'All recommendations', value: 'all', count: Object.keys( audits ).length },
					].concat(
						Object.keys( metricsNames ).map( ( key ) => ( {
							label: metricsNames[ key as keyof typeof metricsNames ]?.name,
							value: key,
							count: Object.keys( audits ).filter( ( auditKey ) =>
								filterRecommendations( key, audits[ auditKey ] )
							).length,
						} ) )
					) }
					compact
				/>

				<div>
					{ screenshots.map( ( screenshot, index ) => {
						const timing = `${ ( screenshot.timing / 1000 ).toFixed( 1 ) }s`;
						return (
							<div key={ index } style={ { float: 'left' } }>
								<img alt={ timing } src={ screenshot.data } />
								<div>{ timing }</div>
							</div>
						);
					} ) }
				</div>
			</CardBody>
		</Card>
	);
}
