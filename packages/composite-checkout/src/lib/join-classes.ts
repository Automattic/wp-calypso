export default function joinClasses( classNames: ( string | number | undefined )[] ): string {
	return classNames.filter( ( x ) => x ).join( ' ' );
}
