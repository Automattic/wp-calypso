import { type Callback } from '@automattic/calypso-router';

export const referralsContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>referrals</div>;

	next();
};
