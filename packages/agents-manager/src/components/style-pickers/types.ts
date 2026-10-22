/** What a picker gets on an interactive UI surface. */
export interface PickerSurfaceProps {
	/** The surface the picker sits on, which keys its checkpoint. */
	surfaceId?: string;
	/** While the agent replies, or once the surface is stale, picks are off. */
	disabled?: boolean;
}
