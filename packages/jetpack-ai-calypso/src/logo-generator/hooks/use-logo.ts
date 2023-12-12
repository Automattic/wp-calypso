/**
 * External dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
/**
 * Types
 */
import { UseLogoProps } from '../../types';

const useLogo = ( { subject = 'World' }: UseLogoProps ) => {
	const message: string = sprintf(
		/* translators: %s is the subject */
		__( 'Hello %s', 'jetpack-ai-calypso' ),
		subject
	);

	return {
		message,
	};
};

export default useLogo;
