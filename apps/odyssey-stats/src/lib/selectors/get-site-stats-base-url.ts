import getOdysseyStatsBaseUrl from './get-odyssey-stats-base-url';

const getSiteStatsBaseUrl = (): string => `${ getOdysseyStatsBaseUrl() }#!`;

export default getSiteStatsBaseUrl;
