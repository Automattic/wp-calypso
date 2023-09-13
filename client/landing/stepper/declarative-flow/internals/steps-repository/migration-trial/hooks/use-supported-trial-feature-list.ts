import { useI18n } from '@wordpress/react-i18n';

export default function useSupportedTrialFeatureList() {
	const { __ } = useI18n();

	return [
		__( 'Beautiful themes' ),
		__( 'Advanced Design Tools' ),
		__( 'Newsletters' ),
		__( 'Jetpack backups and restores' ),
		__( 'Spam protection with Akismet' ),
		__( 'SEO tools' ),
		__( 'Google Analytics' ),
		__( 'Best-in-class hosting' ),
	];
}
