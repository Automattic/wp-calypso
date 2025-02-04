import { Tooltip } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import type { ReferralAPIResponse } from '../../referrals/types';

export default function ClientSite( { referral }: { referral: ReferralAPIResponse } ) {
	const translate = useTranslate();

	const tooltipRef = useRef( null );
	const [ showTooltip, setShowTooltip ] = useState( false );

	return (
		<>
			<div
				onMouseEnter={ () => setShowTooltip( true ) }
				onMouseLeave={ () => setShowTooltip( false ) }
				onMouseDown={ () => setShowTooltip( false ) }
				onTouchStart={ () => setShowTooltip( true ) }
				role="button"
				tabIndex={ 0 }
				ref={ tooltipRef }
			>
				{ translate( '{{b}}%(email)s{{/b}} owns this', {
					args: { email: referral.client.email },
					components: {
						b: <strong />,
					},
				} ) }
			</div>
			<Tooltip showOnMobile context={ tooltipRef.current } isVisible={ showTooltip }>
				{ referral.client.email }
			</Tooltip>
		</>
	);
}
