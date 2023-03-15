import * as selectors from './selectors';
import type { SelectFromMap } from '../mapped-types';

export type WpcomPlansUISelect = SelectFromMap< typeof selectors >;

export interface DomainUpsellDialog {
	show: boolean;
}
