export default function joinClasses( classNames: string[] ): string {
	return classNames.filter( ( x ) => x ).join( ' ' );
}
