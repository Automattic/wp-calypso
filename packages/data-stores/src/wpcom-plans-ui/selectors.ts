import type { State } from './reducer';

export const isDomainUpsellDialogShown = ( state: State ) => !! state.showDomainUpsellDialog;
