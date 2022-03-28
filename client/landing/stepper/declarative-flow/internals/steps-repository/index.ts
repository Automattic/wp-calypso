export { default as courses } from './courses';
export { default as intent } from './intent-step';
export { default as options } from './site-options';
export { default as bloggerStartingPoint } from './blogger-starting-point';
export { default as storeFeatures } from './store-features';
export { default as designSetup } from './design-setup';
export { default as storeAddress } from './store-address';

export type StepPath =
	| 'courses'
	| 'intent'
	| 'options'
	| 'bloggerStartingPoint'
	| 'storeFeatures'
	| 'designSetup'
	| 'storeAddress';
