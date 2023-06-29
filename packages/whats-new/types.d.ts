// Fixed node_modules/@wordpress/components/build-types/dropdown-menu/types.d.ts(43,24): error TS2339: Property 'role' does not exist on type 'HTMLElement'.
interface HTMLElement {
	role: string;
}

declare module '@wordpress/notices' {
	export type Status = 'error' | 'info' | 'success' | 'warning';
	export const store: string;
}

declare module '@wordpress/rich-text' {
	interface Format {
		type: string;
		attributes?: Record< string, string > | undefined;
		unregisteredAttributes?: Record< string, string > | undefined;
		object?: boolean | undefined;
	}

	export interface Value {
		activeFormats?: readonly Format[] | undefined;
		end?: number | undefined;
		formats: ReadonlyArray< Format[] | undefined >;
		replacements: ReadonlyArray< Format[] | undefined >;
		start?: number | undefined;
		text: string;
	}

	// Fixed node_modules/@wordpress/components/build-types/autocomplete/types.d.ts(6,15): error TS2305: Module '"@wordpress/rich-text"' has no exported member 'RichTextValue'.
	export type RichTextValue = Record< string, unknown >;
}

declare module '@automattic/whats-new' {
	type FunctionProps = {
		onClose: () => void;
	};
	function WhatsNewGuide( props: FunctionProps ): JSX.Element;
	export default WhatsNewGuide;
}
