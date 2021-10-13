export function joinClasses( classNames: ( string | null | undefined )[] ): string {
	return classNames.filter( ( x ) => x ).join( ' ' );
}
