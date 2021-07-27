// Browser Manager
export type viewportName = 'desktop' | 'mobile' | 'laptop' | 'tablet';
export type localeCode = string;

export type viewportSize = {
	width: number;
	height: number;
};

// Workaround to get a type from predefined array.
// See https://stackoverflow.com/a/59857409.
const gutterValuesArray = [ 'None', 'Small', 'Medium', 'Large', 'Huge' ] as const;
export type gutterValues = typeof gutterValuesArray[ number ];
