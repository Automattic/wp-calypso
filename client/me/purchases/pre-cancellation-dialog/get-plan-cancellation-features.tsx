export default function getPlanCancellationFeatures( productSlug: string | undefined ): string[] {
	if ( ! productSlug ) {
		return [];
	}

	return [ 'Feature 1', 'Feature 2', 'Feature 3' ];
}
