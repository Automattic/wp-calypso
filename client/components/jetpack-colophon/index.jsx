import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';

import './style.scss';

const JetpackColophon = ( { className, translate, grayscale = false } ) => {
	return (
		<div className={ classNames( 'jetpack-colophon', className ) }>
			<span
				className={ classNames( 'jetpack-colophon__power', {
					'jetpack-colophon__grayscale': grayscale,
				} ) }
			>
				{ translate( 'Powered by {{jetpackLogo /}}', {
					components: {
						jetpackLogo: <JetpackLogo size={ 32 } full />,
					},
				} ) }
			</span>
		</div>
	);
};

export default localize( JetpackColophon );
