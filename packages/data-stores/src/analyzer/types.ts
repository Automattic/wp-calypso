import * as actions from './actions';
import type { DispatchFromMap } from '../mapped-types';

interface Color {
	name: string;
	hex: string;
}

export interface ColorsData {
	logo: Color[];
	links: Color[];
	favicon: Color[];
	body?: Color;
	theme_color?: Color;
}

export interface AnalyzeColorsResponse {
	url: string;
	status: string;
	colors: ColorsData;
}

type SiteUrl = string;
export type ColorsState = {
	analyzing?: boolean;
	colors?: { [ key: SiteUrl ]: ColorsData };
};

export interface Dispatch {
	dispatch: DispatchFromMap< typeof actions >;
}
