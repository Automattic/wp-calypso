import { isEnabled } from '@automattic/calypso-config';
import { WordPressLogo } from '@automattic/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState } from 'react';
import Tooltip from 'calypso/components/tooltip';
import useWPPlanName from './hooks/use-wp-plan-name';
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

	const planName = useWPPlanName( site.active_paid_subscription_slugs );

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

	return (
		isWPCOMAtomicSiteCreationEnabled &&
		( isLargeScreen ? (
			<>
				<div { ...props }>
					<WordPressLogo
						className={ classNames( 'wordpress-logo', { 'is-visible': isWPCOMAtomicSite } ) }
						size={ 18 }
					/>
				</div>
				<Tooltip context={ ref.current } isVisible={ showPopover }>
					{ planName }
				</Tooltip>
			</>
		) : (
			isWPCOMAtomicSite && (
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
			)
		) )
	);
};
