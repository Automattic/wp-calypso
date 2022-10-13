export const loadFramerFeatures = async ( feature: string ) => {
	let featurePath = '';
	switch ( feature ) {
		case 'domAnimation':
			featurePath = './domAnimation';
			break;
		case 'domMax':
			featurePath = './domMax';
			break;
	}
	const mod = await import( `${ featurePath }` );
	return mod.default;
};
