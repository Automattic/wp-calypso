import config from '@automattic/calypso-config';

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;
	return ! [ 'production', 'desktop' ].includes( currentEnvironment );
};

export const getBadRatingReasons = () => {
	if ( isTestModeEnvironment() ) {
		return [
			{ label: 'No reason provided', value: '' },
			{ label: 'It took too long to get a reply.', value: '1001' },
			{ label: 'The product cannot do what I want.', value: '1002' },
			{ label: 'The issue was not resolved.', value: '1003' },
			{ label: 'The Happiness Engineer was unhelpful.', value: '1004' },
		];
	}

	return [
		{ label: 'No reason provided', value: '' },
		{ label: 'It took too long to get a reply.', value: '1000' },
		{ label: 'The product cannot do what I want.', value: '1001' },
		{ label: 'The issue was not resolved.', value: '1002' },
		{ label: 'The Happiness Engineer was unhelpful.', value: '1003' },
	];
};
