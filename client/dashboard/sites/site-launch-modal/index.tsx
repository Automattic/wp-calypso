import { useQuery } from '@tanstack/react-query';
import { useResizeObserver } from '@wordpress/compose';
import { useAnalytics } from '../../app/analytics';
import { useAppContext } from '../../app/context';
import { getAddSiteDomainUrl } from '../../utils/domain-url';
import { getSitePlanDisplayName } from '../../utils/site-plan';
import SitePreview from '../site-preview';
import CelebrationModal from './views/celebration-modal';
import PreLaunchModal from './views/pre-launch-modal';
import type { Site } from '@automattic/api-core';

import './styles.scss';

const PREVIEW_BASE_WIDTH = 1200;

export type CelebrationSite = Pick< Site, 'ID' | 'slug' | 'URL' > & {
	plan?: Pick< Required< Site >[ 'plan' ], 'is_free' | 'product_slug' >;
};

interface CommonProps {
	isOpen: boolean;
	onClose: () => void;
}

interface CelebrationVariantProps extends CommonProps {
	variant: 'celebration';
	site: CelebrationSite;
}

interface PreLaunchVariantProps extends CommonProps {
	variant: 'pre-launch';
	site: Site;
	isLaunching: boolean;
	onLaunch: () => void;
}

type SiteLaunchModalProps = CelebrationVariantProps | PreLaunchVariantProps;

export default function SiteLaunchModal( props: SiteLaunchModalProps ) {
	const { isOpen, onClose } = props;
	const { recordTracksEvent } = useAnalytics();
	const { queries } = useAppContext();
	const { data: domains = [], isFetchedAfterMount: isDomainsDataReady } = useQuery( {
		...queries.domainsQuery(),
		enabled: isOpen,
		select: ( data ) => data.filter( ( domain ) => domain.blog_id === props.site.ID ),
	} );
	const [ previewResizeListener, { width: previewWidth, height: previewHeight } ] =
		useResizeObserver();

	if ( ! isOpen ) {
		return null;
	}

	// The celebration variant needs the domain list settled to decide upsell
	// content; the pre-launch variant is opened from the launch button, which
	// has already loaded the domains, so it can render with cached data.
	if ( props.variant === 'celebration' && ! isDomainsDataReady ) {
		return null;
	}

	const customDomains = domains.filter( ( domain ) => domain.subscription_id !== null );
	const hasCustomDomain = customDomains.length > 0;
	const siteDomain = hasCustomDomain ? customDomains[ 0 ].domain : props.site.slug;

	if ( props.variant === 'pre-launch' ) {
		const { site, isLaunching, onLaunch } = props;
		const planName = site.plan?.product_name ?? getSitePlanDisplayName( site );

		return (
			<PreLaunchModal
				siteName={ site.name }
				siteDomain={ siteDomain }
				planName={ planName }
				isLaunching={ isLaunching }
				onLaunch={ onLaunch }
				onClose={ onClose }
				preview={
					site.URL ? (
						<div className="site-launch-pre-launch-modal__thumbnail">
							{ previewResizeListener }
							{ !! previewWidth && !! previewHeight && (
								<SitePreview
									url={ site.URL }
									scale={ previewWidth / PREVIEW_BASE_WIDTH }
									height={ previewHeight / ( previewWidth / PREVIEW_BASE_WIDTH ) }
								/>
							) }
						</div>
					) : null
				}
			/>
		);
	}

	const { site } = props;

	return (
		<CelebrationModal
			siteDomain={ siteDomain }
			siteUrl={ site.URL }
			hasCustomDomain={ hasCustomDomain }
			isPaidPlan={ ! site.plan?.is_free }
			isBilledMonthly={ !! site.plan?.product_slug?.includes( 'monthly' ) }
			upsellHref={ getAddSiteDomainUrl( site.slug ) }
			onUpsellClick={ () =>
				recordTracksEvent( 'calypso_launchpad_celebration_modal_upsell_clicked', {
					product_slug: site?.plan?.product_slug,
				} )
			}
			onClose={ onClose }
		/>
	);
}
