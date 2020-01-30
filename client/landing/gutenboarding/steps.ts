/**
 * External dependencies
 */
import { map } from 'lodash';

export enum Step {
	IntentGathering = '/',
	DesignSelection = '/design',
	CreateSite = '/create-site',
}

export const routes = `(${ map( Step, ( route: string ) => route ).join( '|' ) })`;
