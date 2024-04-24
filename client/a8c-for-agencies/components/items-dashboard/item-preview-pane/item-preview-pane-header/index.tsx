import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import SiteIcon from 'calypso/blocks/site-icon';
import { ItemData } from '../types';

import './style.scss';

const ICON_SIZE = 24;

interface Props {
	closeItemPreviewPane?: () => void;
	itemData: ItemData;
	className?: string;
}

export default function ItemPreviewPaneHeader( {
	itemData,
	closeItemPreviewPane,
	className,
}: Props ) {
	const itemColor = itemData.color ?? 'linear-gradient(45deg, #ff0056, #ff8a78, #57b7ff, #9c00d4)';
	const size = 40;

	const defaultFavicon = <div className="no-favicon" style={ { background: itemColor } } />;

	return (
		<div className={ classNames( 'item-preview__header', className ) }>
			<div className="item-preview__header-content">
				<div className={ classNames( 'site-favicon', className ) }>
					<SiteIcon size={ size } defaultIcon={ defaultFavicon } />
				</div>
				<div className="item-preview__header-title-summary">
					<div className="item-preview__header-title">{ itemData.title }</div>
					<div className="item-preview__header-summary">
						<Button
							variant="link"
							className="site-preview__header-summary-link"
							href={ itemData.url }
							target="_blank"
						>
							<span>{ itemData.subtitle }</span>
							<Icon className="sidebar-v2__external-icon" icon={ external } size={ ICON_SIZE } />
						</Button>
					</div>
				</div>
				<Button
					onClick={ closeItemPreviewPane }
					className="site-preview__close-preview"
					aria-label={ translate( 'Close Preview' ) }
				>
					<Gridicon icon="cross" size={ ICON_SIZE } />
				</Button>
			</div>
		</div>
	);
}
