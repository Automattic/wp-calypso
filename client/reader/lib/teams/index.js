/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';

export const isAutomatticTeamMember = teams => !! find( teams, [ 'slug', 'a8c' ] );
