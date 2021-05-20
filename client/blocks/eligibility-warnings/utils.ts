export function isAtomicSiteWithoutBusinessPlan( holds: string[] ): boolean {
	return holds.includes( 'TRANSFER_ALREADY_EXISTS' ) && holds.includes( 'NO_BUSINESS_PLAN' );
}
