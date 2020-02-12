import { APPLICATION_SET } from 'state/action-types';

export default function setApplication( application ) {
	return {
		type: APPLICATION_SET,
		application,
	};
}
