declare const wpcomGlobalStyles: { upgradeUrl: string };

import { ExternalLink, Fill, Notice } from '@wordpress/components';
import { createInterpolateElement, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { recordUpgradeNoticeClick, recordUpgradeNoticeShow, useGlobalStylesConfig } from './utils';

const GLOBAL_STYLES_SCREEN_ROOT_CONTEXT = 'global-styles-screen-root';

export function GlobalStylesScreenRootNotice() {
	const { isVisible } = useGlobalStylesConfig();

	useEffect( () => {
		if ( isVisible ) {
			recordUpgradeNoticeShow( GLOBAL_STYLES_SCREEN_ROOT_CONTEXT );
		}
	}, [ isVisible ] );

	if ( ! isVisible ) {
		return;
	}

	return (
		<Fill name="GlobalStylesScreenRoot">
			<Notice status="warning" isDismissible={ false } className="wpcom-global-styles-notice">
				{ createInterpolateElement(
					__( '<a>Upgrade your plan</a> to keep your style changes.', 'full-site-editing' ),
					{
						a: (
							<ExternalLink
								href={ wpcomGlobalStyles.upgradeUrl }
								target="_blank"
								onClick={ () => recordUpgradeNoticeClick( GLOBAL_STYLES_SCREEN_ROOT_CONTEXT ) }
							/>
						),
					}
				) }
			</Notice>
		</Fill>
	);
}
