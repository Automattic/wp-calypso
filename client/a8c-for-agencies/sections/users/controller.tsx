import { type Callback } from '@automattic/calypso-router';

export const usersContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>users</div>;

	next();
};
