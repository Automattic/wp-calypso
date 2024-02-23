import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import { translate } from 'i18n-calypso';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	title: string;
	url: string;
	urlWithScheme: string;
	closeSitePreviewPane: () => void;
}

export default function SitePreviewPaneHeader( {
	title,
	url,
	urlWithScheme,
	closeSitePreviewPane,
}: Props ) {
	return (
		<div className="site-preview__header">
			<div className="site-preview__header-bg"></div>
			<div className="sites-dataviews__site-favicon site-preview__header-favicon"></div>
			<div className="site-preview__header-content">
				<div className="site-preview__header-title-summary">
					<div className="site-preview__header-title">{ title }</div>
					<div className="site-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ urlWithScheme }
							target="_blank"
						>
							<span>{ url }</span>
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
