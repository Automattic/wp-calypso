export { default as courses } from './courses';
export { default as intent } from './intent-step';
export { default as options } from './site-options';
export { default as sell } from './sell';
export { default as bloggerStartingPoint } from './blogger-starting-point';
export { default as designSetup } from './design-setup';

export type StepPath =
	| 'courses'
	| 'intent'
	| 'options'
	| 'sell'
	| 'bloggerStartingPoint'
	| 'designSetup';
