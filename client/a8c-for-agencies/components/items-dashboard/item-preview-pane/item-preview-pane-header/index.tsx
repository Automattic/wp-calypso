import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useMediaQuery } from '@wordpress/compose';
import { Icon, external } from '@wordpress/icons';
import classNames from 'classnames';
import { translate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useSiteAdminInterfaceData } from 'calypso/state/sites/hooks';
import SiteFavicon from '../../site-favicon';
import { ItemData, ItemPreviewPaneHeaderExtraProps } from '../types';

import './style.scss';

const ICON_SIZE_SMALL = 16;
const ICON_SIZE_REGULAR = 24;

interface Props {
	closeItemPreviewPane?: () => void;
	itemData: ItemData;
	className?: string;
	extraProps?: ItemPreviewPaneHeaderExtraProps;
}

export default function ItemPreviewPaneHeader( {
	itemData,
	closeItemPreviewPane,
	className,
	extraProps,
}: Props ) {
	const isLargerThan960px = useMediaQuery( '(min-width: 960px)' );
	const size = isLargerThan960px ? 64 : 50;

	const focusRef = useRef< HTMLInputElement >( null );

	const { adminLabel, adminUrl } = useSiteAdminInterfaceData( itemData.blogId );

	// Use useEffect to set the focus when the component mounts
	useEffect( () => {
		if ( focusRef.current ) {
			focusRef.current.focus();
		}
	}, [] );

	return (
		<div className={ classNames( 'item-preview__header', className ) }>
			<div className="item-preview__header-content">
				<SiteFavicon
					blogId={ itemData.blogId }
					fallback={ itemData.isDotcomSite ? 'wordpress-logo' : 'color' }
					color={ itemData.color }
					className="item-preview__header-favicon"
					size={ size }
				/>
				<div className="item-preview__header-info">
					<div className="item-preview__header-title-summary">
						<div className="item-preview__header-title">{ itemData.title }</div>
						<div className="item-preview__header-summary">
							<Button
								variant="link"
								className="item-preview__header-summary-link"
								href={ itemData.url }
								target="_blank"
							>
								<span>{ itemData.subtitle }</span>
								<Icon
									className="sidebar-v2__external-icon"
									icon={ external }
									size={ extraProps?.externalIconSize || ICON_SIZE_SMALL }
								/>
							</Button>
						</div>
					</div>
					<div className="item-preview__header-actions">
						{ itemData.adminUrl ? (
							<>
								<Button
									onClick={ closeItemPreviewPane }
									className="item-preview__close-preview-button"
									variant="secondary"
								>
									{ translate( 'Close' ) }
								</Button>
								<Button
									variant="primary"
									className="item-preview__admin-button"
									href={ `${ adminUrl }` }
									ref={ focusRef }
								>
									{ adminLabel }
								</Button>
							</>
						) : (
							<Button
								onClick={ closeItemPreviewPane }
								className="item-preview__close-preview"
								aria-label={ translate( 'Close Preview' ) }
								ref={ focusRef }
							>
								<Gridicon icon="cross" size={ ICON_SIZE_REGULAR } />
							</Button>
						) }
					</div>
				</div>
			</div>
		</div>
	);
}
