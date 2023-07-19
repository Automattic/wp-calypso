// TODO: Attempt removing after https://github.com/Automattic/wp-calypso/pull/78711
// Fixed node_modules/@wordpress/components/build-types/dropdown-menu/types.d.ts(43,24): error TS2339: Property 'role' does not exist on type 'HTMLElement'.
interface HTMLElement {
	role: string;
}
declare module '@automattic/whats-new' {
	type FunctionProps = {
		onClose: () => void;
	};
	function WhatsNewGuide( props: FunctionProps ): JSX.Element;
	export default WhatsNewGuide;
}
