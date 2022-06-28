import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

interface Color {
	name: string;
	hex: string;
}

export interface ColorsData {
	link: Color[];
	text: Color[];
	background: Color[];
}

interface PreferredPalettes {
	preferred_palettes: ColorsData[];
}

export interface AnalyzeColorsResponse {
	url: string;
	status: string;
	colors: ColorsData & PreferredPalettes;
}

type SiteUrl = string;
export type ColorsState = {
	analyzing?: boolean;
	colors?: { [ key: SiteUrl ]: ColorsData & PreferredPalettes };
};

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
