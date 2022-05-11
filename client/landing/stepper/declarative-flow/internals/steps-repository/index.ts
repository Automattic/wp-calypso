export { default as courses } from './courses';
export { default as intent } from './intent-step';
export { default as podcastTitle } from './podcast-title';
export { default as options } from './site-options';
export { default as bloggerStartingPoint } from './blogger-starting-point';
export { default as storeFeatures } from './store-features';
export { default as designSetup } from './design-setup';
export { default as import } from './import';
export { default as importList } from './import-list';
export { default as importReady } from './import-ready';
export { default as importReadyNot } from './import-ready-not';
export { default as importReadyWpcom } from './import-ready-wpcom';
export { default as importReadyPreview } from './import-ready-preview';
export { default as businessInfo } from './business-info';
export { default as storeAddress } from './store-address';
export { default as vertical } from './site-vertical';
export { default as wooTransfer } from './woo-transfer';
export { default as wooInstallPlugins } from './woo-install-plugins';
export { default as processing } from './processing-step';
export { default as error } from './error-step';
export { default as wooConfirm } from './woo-confirm';

export type StepPath =
	| 'courses'
	| 'intent'
	| 'podcastTitle'
	| 'options'
	| 'bloggerStartingPoint'
	| 'storeFeatures'
	| 'designSetup'
	| 'import'
	| 'importList'
	| 'importReady'
	| 'importReadyNot'
	| 'importReadyWpcom'
	| 'importReadyPreview'
	| 'businessInfo'
	| 'storeAddress'
	| 'processing'
	| 'vertical'
	| 'wooTransfer'
	| 'wooInstallPlugins'
	| 'error'
	| 'wooConfirm';
