declare module 'browser-filesaver' {
	export function saveAs( data: Blob, filename: string, disableAutoBOM?: boolean ): void;
}

declare module 'is-my-json-valid' {
	export default function ( schema: any, options?: any ): ( data: any ) => boolean;
	export function filter( schema: any, options?: any ): any;
}
