import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { ItemData } from '../types';

import './style.scss';

const ICON_SIZE = 24;

interface Props extends ItemData {
	closeSitePreviewPane?: () => void;
	className?: string;
}

export default function SitePreviewPaneHeader( {
	itemTitle,
	itemSubtitle,
	itemUrl,
	itemColor,
	closeSitePreviewPane,
	className,
}: Props ) {
	const siteColor = itemColor ?? 'linear-gradient(45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4)';

	return (
		<div className={ classNames( 'site-preview__header', className ) }>
			<div className="site-preview__header-content">
				<div className="no-favicon" style={ { background: siteColor } } />
				<div className="site-preview__header-title-summary">
					<div className="site-preview__header-title">{ itemTitle }</div>
					<div className="site-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ itemUrl }
							target="_blank"
						>
							<span>{ itemSubtitle }</span>
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
