export function camelToSnakeCase( camelCaseString: string ): string {
	return camelCaseString.replace(
		/[A-Z]/g,
		( letter: string ): string => `_${ letter.toLowerCase() }`
	);
}
