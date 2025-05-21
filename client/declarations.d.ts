declare module 'browser-filesaver' {
	export function saveAs( data: Blob, filename: string, disableAutoBOM?: boolean ): void;
}

declare module 'is-my-json-valid' {
	export default function ( schema: any, options?: any ): ( data: any ) => boolean;
	export function filter( schema: any, options?: any ): any;
}

declare module '*.module.css' {
	const content: { [ className: string ]: string };
	export default content;
}

declare module '*.module.scss' {
	const content: { [ className: string ]: string };
	export default content;
}
