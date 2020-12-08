export default function joinClasses( classNames: ( string | undefined )[] ): string {
	return classNames.filter( ( x ) => x ).join( ' ' );
}
