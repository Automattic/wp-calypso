/**
 * PROTOTYPE: always-on sidebar Upgrade banner that opens the slide-over
 * checkout instead of navigating to /plans → checkout.
 *
 * Rendered from current-site/notice.jsx, in the same slot as the JITM
 * sidebar banner, and reuses the same Banner component + `upsell-nudge`
 * class so it picks up the real sidebar banner styling.
 */

import { useState } from 'react';
import UpgradeSlideOver from 'calypso/blocks/upgrade-slide-over';
import Banner from 'calypso/components/banner';

export default function UpgradeSlideOverBanner() {
	const [ isOpen, setIsOpen ] = useState( false );

	return (
		<>
			<Banner
				className="upsell-nudge"
				compact
				disableHref
				showIcon={ false }
				title="Your plan upgrade credit's ready"
				callToAction="Upgrade"
				onClick={ ( event ) => {
					event?.preventDefault?.();
					setIsOpen( true );
				} }
			/>
			{ isOpen && <UpgradeSlideOver onClose={ () => setIsOpen( false ) } /> }
		</>
	);
}
