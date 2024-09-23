import { Button, Gridicon, Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';

import './style.scss';

export default function SiteErrorColumn( {
	isA4APluginInstalled,
	openSitePreviewPane,
}: {
	isA4APluginInstalled?: boolean;
	openSitePreviewPane: () => void;
} ) {
	const translate = useTranslate();

	const [ showPopover, setShowPopover ] = useState( false );

	const wrapperRef = useRef< HTMLDivElement | null >( null );

	const tooltip = isA4APluginInstalled
		? translate( "Automattic for Agencies can't connect to this site." )
		: translate( "Jetpack can't connect to this site." );

	return (
		<span className="site-error-column">
			<div
				className="sites-dataview__site-error"
				onMouseEnter={ () => setShowPopover( true ) }
				onMouseLeave={ () => setShowPopover( false ) }
				onMouseDown={ () => setShowPopover( false ) }
				role="button"
				tabIndex={ 0 }
				ref={ wrapperRef }
			>
				<Gridicon size={ 18 } icon="notice-outline" />
				<span>
					{ translate( 'Site connectivity issue: {{button}}Fix now{{/button}}', {
						components: {
							button: <Button borderless onClick={ openSitePreviewPane } />,
						},
					} ) }
				</span>
			</div>
			<Tooltip context={ wrapperRef.current } isVisible={ showPopover } position="top">
				{ tooltip }
			</Tooltip>
		</span>
	);
}
