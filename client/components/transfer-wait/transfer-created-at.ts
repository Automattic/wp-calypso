// The transfers endpoint serializes `created_at` as a timezone-naive UTC string
// ('2026-08-12 13:11:10'). Date.parse reads that shape as local time — or NaN on
// some engines — which shifts a fresh transfer's apparent age by the viewer's UTC
// offset: east of UTC that alone exceeds the five-minute install deadline.
const NAIVE_UTC = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function parseTransferCreatedAt( createdAt: string ): number {
	if ( NAIVE_UTC.test( createdAt ) ) {
		return Date.parse( createdAt.replace( ' ', 'T' ) + 'Z' );
	}
	return Date.parse( createdAt );
}
