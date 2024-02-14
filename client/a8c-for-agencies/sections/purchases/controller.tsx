import page, { type Callback } from '@automattic/calypso-router';

export const purchasesContext: Callback = () => {
	page( '/purchases/billing' );
};

export const billingContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>billing</div>;

	next();
};

export const paymentMethodsContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>payment methods</div>;

	next();
};

export const invoicesContext: Callback = ( context, next ) => {
	context.header = <div>Header</div>;
	context.secondary = <div>Secondary</div>;
	context.primary = <div>invoices</div>;

	next();
};
