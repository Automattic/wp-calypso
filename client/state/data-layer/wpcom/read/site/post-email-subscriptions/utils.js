import { includes } from 'lodash';

export function buildBody( frequency ) {
	const validFrequencies = [ 'instantly', 'daily', 'weekly' ];
	if ( includes( validFrequencies, frequency ) ) {
		return {
			delivery_frequency: frequency,
		};
	}
	return {};
}
