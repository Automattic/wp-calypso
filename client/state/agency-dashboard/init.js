import reducer from 'calypso/state/agency-dashboard/reducer';
import { registerReducer } from 'calypso/state/redux-store';

registerReducer( [ 'agencyDashboard' ], reducer );
