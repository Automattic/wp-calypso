export { default as courses } from './courses';
export { default as intent } from './intent-step';
export { default as podcastTitle } from './podcast-title';
export { default as options } from './site-options';
export { default as bloggerStartingPoint } from './blogger-starting-point';
export { default as storeFeatures } from './store-features';
export { default as designSetup } from './design-setup';
export { default as businessInfo } from './business-info';
export { default as fontPairing } from './font-pairing';
export { default as storeAddress } from './store-address';
export { default as vertical } from './site-vertical';
export { default as processing } from './processing-step';
export { default as error } from './error-step';

export type StepPath =
	| 'courses'
	| 'intent'
	| 'podcastTitle'
	| 'options'
	| 'bloggerStartingPoint'
	| 'storeFeatures'
	| 'designSetup'
	| 'businessInfo'
	| 'fontPairing'
	| 'storeAddress'
	| 'processing'
	| 'vertical'
	| 'error';
