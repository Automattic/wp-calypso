import { FEATURE_SFTP } from '@automattic/calypso-products';
import { AnalyticsProvider } from 'calypso/dashboard/app/analytics';
import { CalloutOverlay } from 'calypso/dashboard/components/callout-overlay';
import PageLayout from 'calypso/dashboard/components/page-layout';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { getRouteFromContext } from 'calypso/utils';
import { useAnalyticsClient } from '../v2/hooks/use-analytics-client';
import { HostingActivationCallout, HostingUpsellCallout } from './components/hosting-callout';
import HostingFeatures from './components/hosting-features';
import { areHostingFeaturesSupported } from './features';
import type { Context, Context as PageJSContext } from '@automattic/calypso-router';
import type { ComponentType } from 'react';

import './style.scss';

export function hostingFeatures( context: PageJSContext, next: () => void ) {
	const state = context.store.getState();
	const site = getSelectedSite( state );

	let content;
	if ( site ) {
		const hasSftpFeature =
			! site.plan?.expired && site.plan?.features.active.includes( FEATURE_SFTP );
		const shouldShowActivationCallout = ! site.is_wpcom_atomic && hasSftpFeature;

		let redirectUrl = context.query.redirect_to;
		if ( ! redirectUrl ) {
			redirectUrl = hasSftpFeature ? `/sites/${ site.slug }/settings` : `/overview/${ site.slug }`;
		}

		content = (
			<>
				<PageViewTracker title="Sites > Hosting Features" path={ getRouteFromContext( context ) } />
				<PageLayout>
					<CalloutOverlay
						callout={
							shouldShowActivationCallout ? (
								<HostingActivationCallout siteId={ site.ID } redirectUrl={ redirectUrl } />
							) : (
								<HostingUpsellCallout siteSlug={ site.slug } />
							)
						}
					/>
				</PageLayout>
			</>
		);
	} else {
		content = <HostingFeatures />;
	}

	context.primary = (
		<>
			<PageViewTracker title="Sites > Hosting Features" path={ getRouteFromContext( context ) } />
			{ content }
		</>
	);

	next();
}

function HostingFeatureCallout( { children }: { children: React.ReactNode } ) {
	const analyticsClient = useAnalyticsClient();
	return <AnalyticsProvider client={ analyticsClient }>{ children }</AnalyticsProvider>;
}

export function hostingFeaturesCallout(
	CalloutComponent: ComponentType< {
		siteSlug: string;
		titleAs?: React.ElementType | keyof JSX.IntrinsicElements;
	} >
) {
	return ( context: Context, next: () => void ) => {
		const state = context.store.getState();
		const site = getSelectedSite( state );

		if ( site && ! areHostingFeaturesSupported( site ) ) {
			const callout =
				! site.is_wpcom_atomic &&
				! site.plan?.expired &&
				site.plan?.features.active.includes( FEATURE_SFTP ) ? (
					<HostingActivationCallout siteId={ site.ID } />
				) : (
					<HostingFeatureCallout>
						<CalloutComponent siteSlug={ site.slug } titleAs="h3" />
					</HostingFeatureCallout>
				);

			context.primary = (
				<div className="hosting-features-callout">
					<PageViewTracker
						title="Sites > Hosting Feature Callout"
						path={ getRouteFromContext( context ) }
					/>
					{ callout }
				</div>
			);
		}

		next();
	};
}
