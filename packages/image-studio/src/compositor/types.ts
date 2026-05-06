/**
 * Shape of the brief returned by the server-side `wpcom/generate-feature-clip-brief`
 * ability and consumed by the client-side EditFrame compositor. The renderer
 * is deterministic for a given brief.
 */
export type FeatureClipStyle = 'informative-photo' | 'promotional-photo';

export type FeatureClipCameraMove = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'static';

export type FeatureClipAudioBed = 'silent' | 'contemplative' | 'energetic';

export interface FeatureClipScene {
	imageUrl: string;
	caption?: string;
	camera: FeatureClipCameraMove;
}

export interface FeatureClipBrief {
	style: FeatureClipStyle;
	scenes: FeatureClipScene[];
	titleCard: { copy: string };
	audioBed?: FeatureClipAudioBed;
}
