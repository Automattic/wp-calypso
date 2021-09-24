export type TourAsset = {
	desktop: { src: string; type: string };
	mobile?: { src: string; type: string };
};

export type TourAssets = {
	[ key: string ]: TourAsset;
};
