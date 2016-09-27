import {
	PLANS_RECEIVE,
	PLANS_REQUEST,
	PLANS_REQUEST_SUCCESS,
} from 'state/action-types';

import plans from './data/plans';

export const requestPlans = ( { dispatch } ) => () => {
	dispatch( { type: PLANS_REQUEST_SUCCESS } );
	dispatch( { type: PLANS_RECEIVE, plans } );
};

export default [ PLANS_REQUEST, requestPlans ];
