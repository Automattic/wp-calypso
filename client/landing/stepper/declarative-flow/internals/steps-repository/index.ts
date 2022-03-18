export { default as domain } from './domain';
export { default as courses } from './courses';
export { default as design } from './design';
export { default as intent } from './intent-step';
export { default as options } from './site-options';
export { default as build } from './build';
export { default as sell } from './sell';
export { default as write } from './write';
export { default as import } from './import';
export { default as wpadmin } from './wpadmin';
export { default as bloggerStartingPoint } from './blogger-starting-point';
export { default as designSetupSite } from './design-setup-site-step';

export type StepPath =
	| 'courses'
	| 'domain'
	| 'design'
	| 'intent'
	| 'build'
	| 'options'
	| 'sell'
	| 'write'
	| 'import'
	| 'wpadmin'
	| 'bloggerStartingPoint'
	| 'designSetupSite';
