import { css } from '@emotion/css';

export const getDashboardUrl = ( slug: string ) => {
	return `/home/${ slug }`;
};

export const getSettingsUrl = ( slug: string ) => {
	return `/settings/general/${ slug }`;
};

export const getPluginsUrl = ( slug: string ) => {
	return `/plugins/${ slug }`;
};

export const getManagePluginsUrl = ( slug: string ) => {
	return `/plugins/manage/${ slug }`;
};

export const getHostingConfigUrl = ( slug: string ) => {
	return `/hosting-config/${ slug }`;
};

export const displaySiteUrl = ( siteUrl: string ) => {
	return siteUrl.replace( 'https://', '' ).replace( 'http://', '' );
};

export const MEDIA_QUERIES = {
	mediumOrSmaller: '@media screen and ( max-width: 781px )',
	mediumOrLarger: '@media screen and ( min-width: 660px )',
	large: '@media screen and ( min-width: 960px )',
};

export const sitePreviewHoverClass = css( {
	position: 'relative',
	':after': {
		content: '""',
		position: 'absolute',
		zIndex: -1,
		top: 0,
		left: 0,
		height: '100%',
		width: '100%',
		opacity: 0,
		boxShadow: '0 5px 15px -13px #000',
		transition: 'opacity 0.3s',
	},
	':hover': {
		':after': {
			opacity: 1,
			transition: 'opacity 0.1s',
		},
	},
} );
