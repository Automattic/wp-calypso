/**
 * Shape of the brief returned by the server-side `wpcom/generate-feature-clip-brief`
 * ability and consumed by the client-side EditFrame compositor. The renderer
 * is deterministic for a given brief.
 */
export type FeatureClipStyle = 'informative-photo' | 'promotional-photo';

export type FeatureClipCameraMove = 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'static';

export type FeatureClipAudioBed = 'silent' | 'contemplative' | 'energetic';

export interface FeatureClipScene {
	// Optional now: text-only scenes (no source images, gradient background)
	// are valid when the post has no usable images, or when the brief mixes
	// text-overlay scenes between image scenes.
	imageUrl?: string;
	caption?: string;
	// Text overlay shown on a gradient background when no imageUrl is present.
	text?: string;
	// Optional small label above the text (e.g. "Step 1", "Key insight").
	eyebrow?: string;
	camera: FeatureClipCameraMove;
}

export interface FeatureClipBrief {
	style: FeatureClipStyle;
	scenes: FeatureClipScene[];
	titleCard: { copy: string };
	audioBed?: FeatureClipAudioBed;
}
