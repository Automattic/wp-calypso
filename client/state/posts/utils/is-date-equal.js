export function isDateEqual( localDateEdit, savedDate ) {
	// if the local date edit is false, it means we are asking the server to reset
	// the scheduled date to "now". In that case, we accept the date value returned
	// by the server and consider the edit saved.
	if ( localDateEdit === false ) {
		return true;
	}

	return localDateEdit && new Date( localDateEdit ).getTime() === new Date( savedDate ).getTime();
}
