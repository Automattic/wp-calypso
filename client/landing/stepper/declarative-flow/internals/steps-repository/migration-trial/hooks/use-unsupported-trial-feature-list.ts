import { useI18n } from '@wordpress/react-i18n';

export default function useUnsupportedTrialFeatureList() {
	const { __ } = useI18n();

	return [
		__( 'Your site will be unpublished' ),
		__( 'No custom domains' ),
		__( 'No SSH or SFTP access' ),
		__( 'Limit of 200GB' ),
		__( 'Limit of 100 subscribers' ),
	];
}
