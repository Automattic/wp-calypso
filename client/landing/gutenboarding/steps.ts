/**
 * External dependencies
 */
import { map } from 'lodash';

export enum Step {
	IntentGathering = '/',
	DesignSelection = '/design',
	CreateSite = '/design',
}

export const routes = `(${ map( Step, ( route: string ) => route ).join( '|' ) })`;
