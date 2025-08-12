import { Gridicon, WordPressLogo } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';

import './login.scss';

export default function MasterbarLogin( { goBackUrl }: { goBackUrl: string } ) {
	const { __ } = useI18n();
	return (
		<header className="masterbar__login">
			<WordPressLogo className="masterbar__login-logo" size={ 24 } />
			{ goBackUrl && (
				<a className="masterbar__login-back-link" href={ goBackUrl }>
					{ createInterpolateElement( __( '<arrow/> Go back' ), {
						arrow: <Gridicon icon="chevron-left" size={ 18 } />,
					} ) }
				</a>
			) }
		</header>
	);
}
