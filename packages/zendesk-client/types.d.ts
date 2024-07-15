interface Window {
	zE?: (
		action: string,
		value: string,
		handler?:
			| ( ( callback: ( data: string | number ) => void ) => void )
			| { id: number; value: string }[]
	) => void;
}
