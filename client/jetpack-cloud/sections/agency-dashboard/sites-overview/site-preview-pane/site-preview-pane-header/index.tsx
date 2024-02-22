import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { translate } from 'i18n-calypso';
import { Site } from '../../types';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	selectedSite?: Site | undefined;
	closeSitePreviewPane: () => void;
}

export default function SitePreviewPaneHeader( { selectedSite, closeSitePreviewPane }: Props ) {
	if ( ! selectedSite ) {
		return null;
	}

	// eslint-disable-next-line no-console
	console.log( selectedSite );

	return (
		<div className="site-preview__header">
			<div className="site-preview__header-bg"></div>
			<div className="sites-dataviews__site-favicon site-preview__header-favicon"></div>
			<div className="site-preview__header-content">
				<div className="site-preview__header-title-summary">
					<div className="site-preview__header-title">{ selectedSite.blogname }</div>
					<div className="site-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ selectedSite.url_with_scheme }
							target="_blank"
						>
							<span>{ selectedSite.url }</span>
							<Icon className="sidebar-v2__external-icon" icon={ external } size={ ICON_SIZE } />
						</Button>
					</div>
				</div>
				<Button
					onClick={ closeSitePreviewPane }
					className="site-preview__close-preview"
					aria-label={ translate( 'Close Preview' ) }
				>
					<Gridicon icon="cross" size={ 24 } />
				</Button>
			</div>
		</div>
	);
}
