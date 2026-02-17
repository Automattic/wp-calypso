/**
 * Represents a single point in an annotation path.
 */
export interface AnnotationPoint {
	x: number;
	y: number;
}

/**
 * Represents a complete annotation path (stroke).
 */
export interface AnnotationPath {
	mode: 'pen';
	width: number;
	points: AnnotationPoint[];
}

/**
 * The current annotation tool being used.
 */
export type AnnotationTool = 'pen';
