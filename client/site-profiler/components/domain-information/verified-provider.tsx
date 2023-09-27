import { Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { translate } from 'i18n-calypso';

export default function VerifiedProvider() {
	return (
		<>
			<span className="status-icon status-icon--small blue">
				{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
				<Gridicon icon="checkmark" size={ 10 } />
			</span>
			<a href="https://wordpress.com">WordPress.com</a>
			&nbsp;&nbsp;
			<a href={ localizeUrl( 'https://wordpress.com/login' ) }>({ translate( 'login' ) })</a>
		</>
	);
}
