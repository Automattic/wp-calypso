// Importing the package auto-registers all 15 built-in formats
// (bold, italic, link, code, image, strikethrough, underline, textColor,
// subscript, superscript, keyboard, unknown, language, math, nonBreakingSpace)
// via its top-level side effects. The previous deep import of
// `default-formats` is no longer permitted by the `exports` field in
// `@wordpress/format-library` 5.46+; the package's only public surface is the
// side-effect main entry.
import '@wordpress/format-library';

export const loadTextFormatting = () => {
	// No-op: formats are registered at module load time via the side-effect
	// import above. Kept as a function for backwards compatibility with the
	// public API of `@automattic/verbum-block-editor`.
};
