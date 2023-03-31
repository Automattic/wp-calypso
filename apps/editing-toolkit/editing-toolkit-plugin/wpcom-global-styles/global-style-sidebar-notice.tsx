declare const wpcomGlobalStyles: { upgradeUrl: string; blogId: string };

import { ExternalLink, Fill, Notice } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { recordUpgradeNoticeSidebarShow, recordUpgradeSidebarNoticeClick } from './tracks-events';
import { useGlobalStylesConfig } from './use-global-styles-config';

const GLOBAL_STYLES_SIDEBAR = 'edit-site/global-styles';

type CoreInterfacePlaceholder = {
	getActiveComplementaryArea: ( area: string ) => string;
};

export function GlobalStylesSidebarNotice() {
	const area = useSelect(
		( select ) =>
			( select( 'core/interface' ) as CoreInterfacePlaceholder ).getActiveComplementaryArea(
				'core/edit-site'
			),
		[]
	);

	const isGlobalStylesSidebar = GLOBAL_STYLES_SIDEBAR === area;

	const globalStylesInUse = useGlobalStylesConfig().globalStylesInUse;

	useEffect( () => {
		if ( globalStylesInUse && isGlobalStylesSidebar ) {
			recordUpgradeNoticeSidebarShow();
		}
	}, [ globalStylesInUse, isGlobalStylesSidebar ] );

	return (
		<Fill name="ComplementaryArea/core/edit-site">
			{ /*
			We'll need to do the condition here because if we are doing an early return, the fill will be introduced at the bottom of the page, which means some additional CSS magic needs to be done.
			*/ }
			{ globalStylesInUse && isGlobalStylesSidebar && (
				<div className="interface-complementary-area">
					<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
						{ createInterpolateElement(
							__(
								'Your changes include customized styles that will only be visible once you <a>upgrade to a Premium plan</a>.',
								'full-site-editing'
							),
							{
								a: (
									<ExternalLink
										href={ wpcomGlobalStyles.upgradeUrl }
										target="_blank"
										onClick={ () => recordUpgradeSidebarNoticeClick() }
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
