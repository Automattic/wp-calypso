// This empty module corresponds to a WordPress script handle of the same name.
// Our build system externalizes and adds it to the script dependencies when it's imported.
declare module 'a8c-fse-common-data-stores' {}

declare module '@automattic/composite-checkout' {
	const CheckoutStepBody: React.ComponentType< any >;
	const CheckoutSummaryArea: React.ComponentType< any >;
	const CheckoutSummaryCard: React.ComponentType< any >;
	const MainContentUI: React.ComponentType< any >;
	const CheckoutStepAreaUI: React.ComponentType< any >;
	const SubmitButtonWrapperUI: React.ComponentType< any >;
	const checkoutTheme: {};
}
