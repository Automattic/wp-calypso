import { isEnabled } from '@automattic/calypso-config';
import { WordPressLogo, Tooltip } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import getWPCOMPlanName from './lib/get-wpcom-plan-name';
import type { Site } from '../types';

export const SiteHostInfo = ( {
	site,
	isLargeScreen = false,
}: {
	site: Site;
	isLargeScreen?: boolean;
} ) => {
	const translate = useTranslate();

	const [ showPopover, setShowPopover ] = useState( false );

	const ref = useRef< HTMLDivElement | null >( null );

	const isWPCOMAtomicSiteCreationEnabled = isEnabled(
		'jetpack/pro-dashboard-wpcom-atomic-hosting'
	);

	const isWPCOMAtomicSite = site.is_atomic;

	const planName = getWPCOMPlanName( site.active_paid_subscription_slugs ?? [] );

	const props = {
		className: 'site-host-info',
		...( isWPCOMAtomicSite && {
			ref,
			role: 'button',
			tabIndex: 0,
			onMouseEnter: () => setShowPopover( true ),
			onMouseLeave: () => setShowPopover( false ),
			onMouseDown: () => setShowPopover( false ),
		} ),
	};

	if ( ! isWPCOMAtomicSiteCreationEnabled ) {
		return null;
	}

	if ( isLargeScreen ) {
		return (
			<>
				<div { ...props }>
					<WordPressLogo
						className={ clsx( 'wordpress-logo', { 'is-visible': isWPCOMAtomicSite } ) }
						size={ 18 }
					/>
				</div>
				<Tooltip context={ ref.current } isVisible={ showPopover }>
					{ planName }
				</Tooltip>
			</>
		);
	} else if ( isWPCOMAtomicSite ) {
		return (
			<div className="site-card__expanded-content-list site-card__content-list-no-error">
				<div className="site-card__expanded-content-header">
					<span className="site-card__expanded-content-key">{ translate( 'Host' ) }</span>
					<span className="site-card__expanded-content-value">
						<span className="site-card__expanded-content-status">
							<div className="site-host-info">
								<WordPressLogo className="wordpress-logo is-visible" size={ 18 } />
							</div>
							{ planName && <span className="site-host-info__plan-name">{ planName }</span> }
						</span>
					</span>
				</div>
			</div>
		);
	}
	return null;
};
