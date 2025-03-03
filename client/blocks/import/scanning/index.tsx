import { useI18n } from '@wordpress/react-i18n';
import Loading from 'calypso/components/loading';

const ScanningStep: React.FunctionComponent = () => {
	const { __ } = useI18n();

	return (
		<Loading title={ __( 'Scanning your site' ) } subtitle={ __( "We'll be done in no time." ) } />
	);
};

export default ScanningStep;
