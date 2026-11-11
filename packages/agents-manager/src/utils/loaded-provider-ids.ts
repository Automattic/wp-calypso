/**
 * Module bridge for the loaded external provider IDs.
 *
 * `loadExternalProviders()` publishes the merged provider list here so
 * non-React callers — the Tracks wrappers — can report which providers were
 * active. Same pattern as `resolved-agent-id`.
 */

let loadedProviderIds: string[] | undefined;

export function setLoadedProviderIds( ids: string[] | undefined ): void {
	loadedProviderIds = ids;
}

export function getLoadedProviderIds(): string[] | undefined {
	return loadedProviderIds;
}
