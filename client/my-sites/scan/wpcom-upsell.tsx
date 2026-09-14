import { PLAN_BUSINESS, PLAN_ECOMMERCE, getPlan } from '@automattic/calypso-products';
import { Page } from '@wordpress/admin-ui';
import { Button, Icon } from '@wordpress/components';
import { shield } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import JetpackFooter from 'calypso/components/jetpack/jetpack-footer';
import JetpackTitle from 'calypso/components/jetpack-title';
import Main from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useTrackCallback from 'calypso/lib/jetpack/use-track-callback';
import { useSelector } from 'calypso/state';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import illustrationUrl from './scan-callout-illustration.svg';

import './style.scss';

export default function WPCOMScanUpsellPage() {
	const translate = useTranslate();
	const onUpgradeClick = useTrackCallback( undefined, 'calypso_jetpack_scan_business_upsell' );
	const siteSlug = useSelector( getSelectedSiteSlug );

	const businessPlanName = getPlan( PLAN_BUSINESS )?.getTitle() ?? '';
	const commercePlanName = getPlan( PLAN_ECOMMERCE )?.getTitle() ?? '';

	return (
		<Main fullWidthLayout className="scan scan__wpcom-upsell">
			<DocumentHead title="Scanner" />
			<PageViewTracker path="/scan/:site" title="Scanner" />

			<Page
				hasPadding
				showSidebarToggle={ false }
				title={ <JetpackTitle title={ translate( 'Scan' ) } /> }
				subTitle={ translate( 'Automated malware scanning and firewall protection.' ) }
			>
				<div className="scan__upsell-callout">
					<div className="scan__upsell-callout-content">
						<Icon className="scan__upsell-callout-icon" icon={ shield } />
						<h2 className="scan__upsell-callout-title">
							{ translate( 'Scan for security threats' ) }
						</h2>
						<p className="scan__upsell-callout-description">
							{ translate(
								'Automated daily scans check for malware and security vulnerabilities, with automated fixes for most issues.'
							) }
						</p>
						<p className="scan__upsell-callout-description">
							{ translate(
								// translators: %(businessPlanName)s is the Business plan name, %(commercePlanName)s is the Commerce plan name
								'Available on the WordPress.com %(businessPlanName)s and %(commercePlanName)s plans.',
								{ args: { businessPlanName, commercePlanName } }
							) }
						</p>
						<Button
							className="scan__upsell-callout-button"
							variant="primary"
							href={ `/checkout/${ siteSlug }/${ PLAN_BUSINESS }` }
							onClick={ onUpgradeClick }
							__next40pxDefaultSize
						>
							{ translate( 'Upgrade plan' ) }
						</Button>
					</div>
					<div className="scan__upsell-callout-image" aria-hidden="true">
						<img src={ illustrationUrl } alt="" />
					</div>
				</div>
			</Page>
			<JetpackFooter />
		</Main>
	);
}
