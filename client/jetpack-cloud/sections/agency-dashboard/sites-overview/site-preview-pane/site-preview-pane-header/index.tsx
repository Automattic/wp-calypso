import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import SiteFavicon from '../../site-favicon';
import { Site } from '../../types';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	site: Site;
	closeSitePreviewPane?: () => void;
	className?: string;
}

export default function SitePreviewPaneHeader( { site, closeSitePreviewPane, className }: Props ) {
	return (
		<div className={ classNames( 'site-preview__header', className ) }>
			<div className="site-preview__header-content">
				<SiteFavicon site={ site } className="site-preview__header-favicon" size={ 64 } />
				<div className="site-preview__header-title-summary">
					<div className="site-preview__header-title">{ site.blogname }</div>
					<div className="site-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ site.url_with_scheme }
							target="_blank"
						>
							<span>{ site.url }</span>
							<Icon className="sidebar-v2__external-icon" icon={ external } size={ ICON_SIZE } />
						</Button>
					</div>
				</div>
				<Button
					onClick={ closeSitePreviewPane }
					className="site-preview__close-preview"
					aria-label={ translate( 'Close Preview' ) }
				>
					<Gridicon icon="cross" size={ ICON_SIZE } />
				</Button>
			</div>
		</div>
	);
}
