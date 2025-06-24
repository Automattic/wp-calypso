import config from '@automattic/calypso-config';
import { isInSupportSession } from '@automattic/data-stores';

export const isTestModeEnvironment = () => {
	const currentEnvironment = config( 'env_id' ) as string;
	// During SU sessions, we want to always target prod. See HAL-154.
	return ! isInSupportSession() && ! [ 'production', 'desktop' ].includes( currentEnvironment );
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
