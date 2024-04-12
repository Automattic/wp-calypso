import { Gridicon } from '@automattic/components';
import { SiteExcerptData } from '@automattic/sites';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import SiteFavicon from '../../site-favicon';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	site: SiteExcerptData;
	closeSitePreviewPane?: () => void;
	className?: string;
}

export default function SitePreviewPaneHeader( { site, closeSitePreviewPane, className }: Props ) {
	const isLargerThan960px = useMediaQuery( '(min-width: 960px)' );
	const size = isLargerThan960px ? 64 : 50;
	return (
		<div className={ classNames( 'site-preview__header', className ) }>
			<div className="site-preview__header-content">
				<SiteFavicon site={ site } className="site-preview__header-favicon" size={ size } />
				<div className="site-preview__header-title-summary">
					<div className="site-preview__header-title">{ site.name }</div>
					<div className="site-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ site.URL }
							target="_blank"
						>
							<span>{ site.slug }</span>
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
