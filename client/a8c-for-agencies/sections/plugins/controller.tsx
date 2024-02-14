import { type Callback } from '@automattic/calypso-router';

export const pluginsContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>plugins</div>;

	next();
};
