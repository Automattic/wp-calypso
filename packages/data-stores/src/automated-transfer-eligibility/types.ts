import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export interface TransferEligibilityError {
	code: string;
	message: string;
}

export interface TransferEligibilityWarning {
	description: string;
	id: string;
	name: string;
	supportUrl: string | undefined;
}

export interface TransferEligibilityWarningsType {
	[ index: string ]: TransferEligibilityWarning[];

	plugins: TransferEligibilityWarning[];
	widgets: TransferEligibilityWarning[];
	subdomain: TransferEligibilityWarning[];
}

export interface TransferEligibility {
	[ index: number ]: TransferEligibility;

	errors: TransferEligibilityError[];
	is_eligible: boolean;
	warnings: TransferEligibilityWarningsType;
}

export type State = {
	[ key: number ]: TransferEligibility;
};

export interface StatusMapping {
	[ key: string ]: any;
}
