import wpcom from 'calypso/lib/wp';

const useSaveAccentColor = () => {
	const saveAccentColor = async ( siteID: number, color: string ) => {
		return wpcom.req.post( {
			path: `/sites/${ siteID }/global-styles-variation/site-accent-color`,
			apiNamespace: 'wpcom/v2',
			body: {
				color,
			},
		} );
	};
	return saveAccentColor;
};

export default useSaveAccentColor;
