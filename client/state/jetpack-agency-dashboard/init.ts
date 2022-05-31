import { registerReducer } from 'calypso/state/redux-store';
import jetpackAgencyDashboardReducer from './reducer';

registerReducer( [ 'jetpackAgencyDashboard' ], jetpackAgencyDashboardReducer );
