import config from '../config-api';

const getOdysseyStatsBaseUrl = () => config( 'odyssey_stats_base_url' ) || '';

export default getOdysseyStatsBaseUrl;
