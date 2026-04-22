/**
 * Studio media-type mode — distinct from `ImageStudioMode` (Edit / Generate).
 *
 * Drives which environment is reported to the agent backend via client context:
 *  - `Image` → emits `client.environment: 'image-studio'` and `client.imageStudio` payload.
 *  - `Video` → emits `client.environment: 'video-studio'` and `client.videoStudio` payload,
 *              which activates the wpcom video route (route-settings/wp-orchestrator/videos.php).
 *
 * Lives in its own module to avoid a circular dependency between
 * `types/index.ts` (which re-exports from `store/index.ts`) and `store/index.ts`
 * (which needs `StudioMode` for the initial state).
 */
export enum StudioMode {
	Image = 'image',
	Video = 'video',
}
