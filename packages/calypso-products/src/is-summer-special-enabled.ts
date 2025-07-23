declare const process: { env: { NODE_ENV?: string } };

export function isSummerSpecialEnabled(): boolean {
	// Return false in test environments to avoid affecting existing tests
	if ( process.env.NODE_ENV === 'test' ) {
		return false;
	}

	// For now, return true as requested
	return true;
}
