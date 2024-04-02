import { type Callback } from '@automattic/calypso-router';
import Landing from './landing';

export const landingContext: Callback = ( context, next ) => {
	context.primary = <Landing />;

	next();
};
