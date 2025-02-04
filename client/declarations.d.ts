declare module 'browser-filesaver' {
	export function saveAs( data: Blob, filename: string, disableAutoBOM?: boolean ): void;
}
