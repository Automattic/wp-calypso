import page from '@automattic/calypso-router';
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
import type { PodcastStatsTopEpisode } from '../hooks/use-show-stats-query';
import type { MouseEvent } from 'react';

type StatsTopEpisodesProps = {
	episodes?: PodcastStatsTopEpisode[];
	siteSlug: string | null | undefined;
	isLoading?: boolean;
};

export default function StatsTopEpisodes( {
	episodes = [],
	siteSlug,
	isLoading = false,
}: StatsTopEpisodesProps ) {
	const translate = useTranslate();

	return (
		<Card className="podcast-stats__section-card">
			<CardBody>
				<VStack spacing={ 4 }>
					<h3 className="podcast-stats__section-title">{ translate( 'Top episodes' ) }</h3>
					{ isLoading && <StatsModulePlaceholder isLoading /> }
					{ ! isLoading && episodes.length === 0 && (
						<Text variant="muted">{ translate( 'No episode plays in this period.' ) }</Text>
					) }
					{ ! isLoading && episodes.length > 0 && (
						<VStack as="ol" spacing={ 0 } className="podcast-stats-list">
							{ episodes.map( ( episode, index ) => {
								const href = `/podcasting/episode/${ episode.post_id }${
									siteSlug ? '/' + siteSlug : ''
								}`;
								const onClick = ( event: MouseEvent< HTMLAnchorElement > ) => {
									if (
										event.defaultPrevented ||
										event.button !== 0 ||
										event.metaKey ||
										event.ctrlKey ||
										event.shiftKey ||
										event.altKey
									) {
										return;
									}
									event.preventDefault();
									page( href );
								};

								return (
									<HStack
										as="li"
										key={ episode.post_id }
										alignment="center"
										justify="space-between"
										className="podcast-stats-list__row"
									>
										<HStack alignment="center" justify="flex-start" spacing={ 3 }>
											<span className="podcast-stats-list__rank">{ index + 1 }</span>
											<a href={ href } onClick={ onClick } className="podcast-stats-list__link">
												{ episode.title || translate( '(Untitled)' ) }
											</a>
										</HStack>
										<Text weight={ 500 }>
											{ translate( '%(plays)s plays', {
												args: { plays: formatNumber( episode.plays ) },
											} ) }
										</Text>
									</HStack>
								);
							} ) }
						</VStack>
					) }
				</VStack>
			</CardBody>
		</Card>
	);
}
