import { formatNumber } from '@automattic/number-formatters';
import {
	Card,
	CardBody,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import StatsModulePlaceholder from 'calypso/my-sites/stats/stats-module/placeholder';
import { formatPodcastAppName, formatPodcastPct } from './stats-summary-tiles';
import type { PodcastStatsAppRow } from '../hooks/use-show-stats-query';

type StatsByAppProps = {
	rows?: PodcastStatsAppRow[];
	isLoading?: boolean;
};

export default function StatsByApp( { rows = [], isLoading = false }: StatsByAppProps ) {
	const translate = useTranslate();

	return (
		<Card className="podcast-stats__section-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<h3 className="podcast-stats__section-title">{ translate( 'By app' ) }</h3>
					{ isLoading && <StatsModulePlaceholder isLoading /> }
					{ ! isLoading && rows.length === 0 && (
						<Text variant="muted">{ translate( 'No app data in this period.' ) }</Text>
					) }
					{ ! isLoading && rows.length > 0 && (
						<VStack as="ul" spacing={ 3 } className="podcast-stats-bars">
							{ rows.map( ( row ) => (
								<li key={ row.app } className="podcast-stats-bars__item">
									<HStack alignment="center" justify="space-between">
										<Text weight={ 500 }>{ formatPodcastAppName( row.app ) }</Text>
										<Text variant="muted">
											{ translate( '%(plays)s plays, %(pct)s', {
												args: {
													plays: formatNumber( row.plays ),
													pct: formatPodcastPct( row.pct ),
												},
											} ) }
										</Text>
									</HStack>
									<div className="podcast-stats-bars__track" aria-hidden="true">
										<div
											className="podcast-stats-bars__bar"
											style={ { inlineSize: `${ Math.min( Math.max( row.pct, 0 ), 100 ) }%` } }
										/>
									</div>
								</li>
							) ) }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
