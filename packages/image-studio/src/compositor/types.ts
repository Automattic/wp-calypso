/**
 * Shape of the brief returned by the server-side `wpcom/generate-feature-clip-brief`
 * ability and consumed by the client-side EditFrame compositor. The renderer
 * is deterministic for a given brief.
 */
// Top-level user-facing styles. The 'informative-photo' / 'promotional-photo'
// values from the prior schema are dormant — code paths still exist for
// when a Type dropdown reintroduces tone differentiation.
export type FeatureClipStyle = 'cinematic' | 'highlights';

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
	/**
	 * Optional fully-qualified audio source for the clip's bed.
	 *
	 * Currently emitted by the server-side compose-video ability as a
	 * `data:audio/wav;base64,...` URL containing Lyria-generated audio. When
	 * present, the renderer fetches + decodes it and feeds the AudioBuffer to
	 * EditFrame's audio bed slot. When absent (Lyria failed, gated off, or
	 * the brief was assembled without audio), the synth fallback in
	 * informative-feature-clip.tsx::installAudioBed runs instead.
	 */
	audioBedUrl?: string;
}
