export function getCurrentUserCannotAddEmailReason( domain ) {
	return domain && ! domain.currentUserCanAddEmail && domain.currentUserCannotAddEmailReason
		? domain.currentUserCannotAddEmailReason
		: null;
}
