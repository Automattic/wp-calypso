import merge from 'lodash/merge';
import set from 'lodash/set';

const analyticsMocks = [
	'ga.recordEvent',
	'ga.recordPageView',
	'mc.bumpStat',
	'pageView.record',
	'tracks.recordEvent',
	'tracks.recordPageView'
];

const mockIt = spy => mock => set( {}, mock, () => spy( mock ) );

export const analyticsMock = spy =>
	analyticsMocks
		.map( mockIt( spy ) )
		.reduce( ( mocks, mock ) => merge( mocks, mock ), {} );

export default analyticsMock;
