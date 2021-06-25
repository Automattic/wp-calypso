/**
 * External dependencies
 */
import type { Action } from 'redux';

export interface IPurchaseFlowState {
	primaryDomain: string | undefined;
	pluginSlugToBeInstalled: string | undefined;
	isPluginInstalledDuringPurchase: boolean;
}

export interface ISetPrimaryDomainCandidateAction extends Action {
	domainName: string | undefined;
}

export interface ISetPluginToBeInstalledAction extends Action {
	pluginSlugToBeInstalled: string | undefined;
}

export interface ISetPluginInstalledDuringPurchaseFlag extends Action {
	isPluginInstalledDuringPurchase: boolean;
}
