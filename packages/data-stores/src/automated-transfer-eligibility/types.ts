import * as actions from './actions';
import { statusMapping } from './constants';
import type { DispatchFromMap } from '../mapped-types';
export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}

export type TransferEligibilityHold = ( typeof statusMapping )[ keyof typeof statusMapping ];

// This type exists for when we haven't checked that code is part of statusMapping.
export interface InternalTransferEligibilityError {
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

	errors: InternalTransferEligibilityError[];
	is_eligible: boolean;
	warnings: TransferEligibilityWarningsType;
}

export type State = {
	[ key: number ]: TransferEligibility;
};
