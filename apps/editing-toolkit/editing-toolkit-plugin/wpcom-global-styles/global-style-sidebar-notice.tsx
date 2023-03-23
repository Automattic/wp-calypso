declare const wpcomGlobalStyles: { upgradeUrl: string };

import { ExternalLink, Fill, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useGlobalStylesConfig } from './use-global-styles-config';
import { recordUpgradeNoticeClick, recordUpgradeNoticeShow } from './utils';

const GLOBAL_STYLES_SIDEBAR = 'edit-site/global-styles';

export function GlobalStylesSidebarNotice() {
	const area = useSelect(
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		( select ) => select( 'core/interface' ).getActiveComplementaryArea( 'core/edit-site' ),
		[]
	);

	const isGlobalStylesSidebar = GLOBAL_STYLES_SIDEBAR === area;

	const isVisible = useGlobalStylesConfig().isVisible;

	useEffect( () => {
		if ( isVisible && isGlobalStylesSidebar ) {
			recordUpgradeNoticeShow( GLOBAL_STYLES_SIDEBAR );
		}
	}, [ isVisible, isGlobalStylesSidebar ] );

	return (
		<Fill name="ComplementaryArea/core/edit-site">
			{ !! isVisible && isGlobalStylesSidebar && (
				<div className="interface-complementary-area">
					<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
						{ createInterpolateElement(
							__( '<a>Upgrade your plan</a> to keep your style changes.', 'full-site-editing' ),
							{
								a: (
									<ExternalLink
										href={ wpcomGlobalStyles.upgradeUrl }
										target="_blank"
										onClick={ () => recordUpgradeNoticeClick( GLOBAL_STYLES_SIDEBAR ) }
									/>
								),
							}
						) }
					</Notice>
				</div>
			) }
		</Fill>
	);
}
