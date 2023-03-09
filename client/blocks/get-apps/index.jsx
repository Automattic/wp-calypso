import config from '@automattic/calypso-config';
import classnames from 'classnames';
import BodySectionCssClass from 'calypso/layout/body-section-css-class';
import DesktopDownloadCard from './desktop-download-card.jsx';
import MobileDownloadCard from './mobile-download-card.jsx';

import './style.scss';

const displayJetpackAppBranding = config.isEnabled( 'jetpack/app-branding' );

export const GetApps = () => {
	return (
		<div
			className={ classnames( 'get-apps__wrapper', {
				jetpack: displayJetpackAppBranding,
			} ) }
		>
			<BodySectionCssClass bodyClass={ [ 'get-apps__body' ] } />
			<MobileDownloadCard />
			{ ! config( 'env_id' ).startsWith( 'desktop' ) && <DesktopDownloadCard /> }
		</div>
	);
};

export default GetApps;
