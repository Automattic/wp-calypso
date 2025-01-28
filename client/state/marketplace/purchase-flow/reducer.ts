import {
	MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE,
	MARKETPLACE_QUEUE_PRODUCT_INSTALL,
} from 'calypso/state/action-types';
import { THEME_TRANSFER_INITIATE_REQUEST } from 'calypso/state/themes/action-types';
import { withSchemaValidation } from 'calypso/state/utils';
import { MARKETPLACE_ASYNC_PROCESS_STATUS, IPurchaseFlowState } from '../types';
import { purchaseFlowSchema } from './schema';
import type { AnyAction } from 'redux';

export const defaultState: IPurchaseFlowState = {
	primaryDomain: null,
	productSlugInstalled: null,
	pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
};

const purchaseFlow = withSchemaValidation(
	purchaseFlowSchema,
	( state: IPurchaseFlowState = defaultState, action: AnyAction ): IPurchaseFlowState => {
		switch ( action.type ) {
			case MARKETPLACE_QUEUE_PRODUCT_INSTALL:
				return {
					...state,
					pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
					productSlugInstalled: action.productSlug,
					primaryDomain: action.primaryDomain,
				};
			case THEME_TRANSFER_INITIATE_REQUEST:
				return {
					...state,
					pluginInstallationStatus: MARKETPLACE_ASYNC_PROCESS_STATUS.UNKNOWN,
				};
			case MARKETPLACE_PLUGIN_INSTALLATION_STATE_CHANGE:
				return {
					...state,
					pluginInstallationStatus: action.state,
				};
			default:
				return state;
		}
	}
);

export default purchaseFlow;
