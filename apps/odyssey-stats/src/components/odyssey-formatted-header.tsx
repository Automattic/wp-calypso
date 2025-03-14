import config from '@automattic/calypso-config';
import CalypsoFormattedHeader, {
	Props as FormattedHeaderProps,
} from 'calypso/components/formatted-header';
import JetpackHeader from 'calypso/components/jetpack/jetpack-header';
import { useSelector } from 'calypso/state';
import { isSimpleSite } from 'calypso/state/sites/selectors';

export default function FormattedHeader( { ...props }: FormattedHeaderProps ) {
	const isSiteSimple = useSelector( ( state ) => isSimpleSite( state ) );
	const isWPAdmin = config.isEnabled( 'is_odyssey' );

	// Calypso deals with admin colors already, so skip if not in WP Admin.
	if ( ! isWPAdmin || isSiteSimple ) {
		return <CalypsoFormattedHeader { ...props } />;
	}
	return <JetpackHeader { ...props } />;
}
