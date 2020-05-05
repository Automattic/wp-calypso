/**
 * External Dependencies
 */
import { find } from 'lodash';

export const isAutomatticTeamMember = ( teams ) => !! find( teams, [ 'slug', 'a8c' ] );
