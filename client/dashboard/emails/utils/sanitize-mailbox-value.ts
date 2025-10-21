export const sanitizeMailboxValue = ( suggestedValue: string ): string =>
	String( suggestedValue )
		.replace( /[^0-9a-z_'.-]/gi, '' )
		.toLowerCase();
