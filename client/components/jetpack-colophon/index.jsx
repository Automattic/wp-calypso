import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import JetpackLogo from 'calypso/components/jetpack-logo';

import './style.scss';

const JetpackColophon = ( { className, translate } ) => {
	return (
		<div className={ classNames( 'jetpack-colophon', className ) }>
			<span className="jetpack-colophon__power">
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
