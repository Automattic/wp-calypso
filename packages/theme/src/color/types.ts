export type ArrayOf12< T > = [ T, T, T, T, T, T, T, T, T, T, T, T ];
export type ColorScaleIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ColorMap = {
	[ key: string ]: ColorScaleIndex | ColorMap;
};

type Element = 'bg-app' | 'bg-surface' | 'bg-fill' | 'bg-overlay' | 'text' | 'stroke' | 'icon';
type Tone = 'default' | 'brand' | 'success' | 'info' | 'warning' | 'error';
type Emphasis = 'strong' | 'default' | 'weak'; // alternatively: 'default' | 'secondary' | 'tertiary';
type State = 'default' | 'hover' | 'active' | 'focus' | 'disabled' | 'selected'; // selected same as pressed, at least for now
type Scheme = 'light' | 'dark';
type Contrast = 'low' | 'normal' | 'high';

// - Generate tokens out of existing docs and hosting dashboard
// - we need a way to use different scale tokens depending on light/dark mode
// - we need to support low/normal/high contrast
// - background vs first step of the scale: figure out differences between light and dark mode
// - expose white/dark transparent tokens for overlays and shadows
// - look into inverse tokens
// - if bg-app and bg-surface are different elements, what about, eg, text and link?

export type ColorMapSpec = {
	[ key in Element ]: {
		[ key in Tone ]: {
			[ key in Emphasis ]:
				| ColorScaleIndex
				| {
						[ key in State ]: ColorScaleIndex;
				  };
		};
	};
};
