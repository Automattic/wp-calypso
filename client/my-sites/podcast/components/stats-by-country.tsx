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
import { formatPodcastCountryName, formatPodcastPct } from './stats-summary-tiles';
import type { PodcastStatsCountryRow } from '../hooks/use-show-stats-query';

type StatsByCountryProps = {
	rows?: PodcastStatsCountryRow[];
	isLoading?: boolean;
};

export default function StatsByCountry( { rows = [], isLoading = false }: StatsByCountryProps ) {
	const translate = useTranslate();
	const unknownCountry = translate( 'Unknown' ) as string;

	return (
		<Card className="podcast-stats__section-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<h3 className="podcast-stats__section-title">{ translate( 'By country' ) }</h3>
					{ isLoading && <StatsModulePlaceholder isLoading /> }
					{ ! isLoading && rows.length === 0 && (
						<Text variant="muted">{ translate( 'No country data in this period.' ) }</Text>
					) }
					{ ! isLoading && rows.length > 0 && (
						<VStack as="ul" spacing={ 3 } className="podcast-stats-bars">
							{ rows.map( ( row ) => (
								<li key={ row.country || 'unknown' } className="podcast-stats-bars__item">
									<HStack alignment="center" justify="space-between">
										<Text weight={ 500 }>
											{ formatPodcastCountryName( row.country, unknownCountry ) }
										</Text>
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
