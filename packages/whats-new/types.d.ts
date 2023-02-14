declare module '@wordpress/components';

declare module '@automattic/whats-new' {
	type FunctionProps = {
		onClose: () => void;
	};
	function WhatsNewGuide( props: FunctionProps ): JSX.Element;
	export default WhatsNewGuide;
}

declare const __i18n_text_domain__: string;
