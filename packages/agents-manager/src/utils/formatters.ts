/**
 * Parse MySQL datetime format to Date object
 * Input format: "2025-11-06 14:29:49"
 * @param mysqlDateTime - MySQL datetime string
 * @returns Date object
 */
export function parseMySQLDateTime( mysqlDateTime: string ): Date {
	// MySQL datetime format: "YYYY-MM-DD HH:MM:SS"
	// Replace space with 'T' to make it ISO-like, then parse
	const isoLike = mysqlDateTime.replace( ' ', 'T' ) + 'Z';
	return new Date( isoLike );
}
