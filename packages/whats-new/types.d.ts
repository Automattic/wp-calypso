declare module '@automattic/whats-new' {
	type FunctionProps = {
		onClose: () => void;
	};
	function WhatsNewGuide( props: FunctionProps ): JSX.Element;
	export default WhatsNewGuide;
}
