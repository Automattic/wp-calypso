/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate, getLocaleSlug } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import MarketingBusinessToolsFeature from './feature';
import MarketingBusinessToolsHeader from './header';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { recordTracksEvent as recordTracksEventAction } from 'calypso/state/analytics/actions';

/**
 * Images
 */
import quickbooksLogo from 'calypso/assets/images/illustrations/quickbooks-logo.svg';
import evernoteLogo from 'calypso/assets/images/illustrations/evernote-logo.svg';
import mondayLogo from 'calypso/assets/images/illustrations/monday-logo.svg';
import benchLogo from 'calypso/assets/images/illustrations/bench-logo.svg';
import jetpackLogo from 'calypso/assets/images/illustrations/jetpack-logo.svg';
import todoistLogo from 'calypso/assets/images/illustrations/todoist-logo.svg';

/**
 * Types
 */
import * as T from 'calypso/types';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	recordTracksEvent: typeof recordTracksEventAction;
	selectedSiteSlug: T.SiteSlug | null;
}

export const MarketingBusinessTools: FunctionComponent< Props > = ( {
	recordTracksEvent,
	selectedSiteSlug,
} ) => {
	const translate = useTranslate();

	const handlePartnerClick = () => {
		recordTracksEvent( 'calypso_marketing_business_boost_my_traffic_button_click' );
	};

	const handleQuickBooksClick = () => {
		recordTracksEvent( 'calypso_marketing_business_quickbooks_button_click' );
	};

	const handleEvernoteClick = () => {
		recordTracksEvent( 'calypso_marketing_business_evernote_button_click' );
	};

	const handleMondayClick = () => {
		recordTracksEvent( 'calypso_marketing_business_monday_button_click' );
	};

	const handleTodoistClick = () => {
		recordTracksEvent( 'calypso_marketing_business_todois_button_click' );
	};

	const handleBenchClick = () => {
		recordTracksEvent( 'calypso_marketing_business_bench_button_click' );
	};

	const handleJetpackClick = () => {
		recordTracksEvent( 'calypso_marketing_business_jetpack_button_click' );
	};

	const handleOwnrClick = () => {
		recordTracksEvent( 'calypso_marketing_business_ownr_button_click' );
	};

	return (
		<Fragment>
			<PageViewTracker path="/marketing/tools/:site" title="Marketing > Tools" />

			<MarketingBusinessToolsHeader handleButtonClick={ handlePartnerClick } />

			<div className="business-tools__feature-list">
				<MarketingBusinessToolsFeature
					category={ translate( 'Finance' ) }
					title={ translate( 'QuickBooks' ) }
					description={ translate(
						"Create and track invoices, track expenses, generate profit & loss statements, and make tax time for your business a breeze with the world's #1 accounting software for small businesses! "
					) }
					imagePath={ quickbooksLogo }
				>
					<Button
						onClick={ handleQuickBooksClick }
						href="https://quickbooks.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Manage your finances' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Evernote' ) }
					description={ translate(
						'Evernote is the place to organize your work, declutter your life, and remember everything. Maintaining the important information you need to manage your work or your personal life has never been easier.'
					) }
					imagePath={ evernoteLogo }
				>
					<Button
						onClick={ handleEvernoteClick }
						href="https://evernote.grsm.io/ebcc-wordpresscom"
						target="_blank"
					>
						{ translate( 'Take better notes today' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Project Management' ) }
					title={ translate( 'Monday.com' ) }
					description={ translate(
						'monday.com is a centralized platform for teams to manage every detail of their work, from high-level roadmap planning to specifics tasks.'
					) }
					imagePath={ mondayLogo }
				>
					<Button
						onClick={ handleMondayClick }
						href="https://mondaycom.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Improve your productivity' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Productivity' ) }
					title={ translate( 'Todoist' ) }
					description={ translate(
						'The to-do list to organize work & life. ✅ Trusted by over 20 million people, Todoist is an incredibly powerful and flexible task management app that can turn your to-do list into a got-it-done list.'
					) }
					imagePath={ todoistLogo }
				>
					<Button
						onClick={ handleTodoistClick }
						href="https://doist.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Manage business tasks' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Finance' ) }
					title={ translate( 'Bench' ) }
					description={ translate(
						'Bench gives you a professional bookkeeper at a price you can afford, and powerful financial reporting software with zero learning curve.'
					) }
					imagePath={ benchLogo }
				>
					<Button
						onClick={ handleBenchClick }
						href="https://bench.grsm.io/wordpresscom"
						target="_blank"
					>
						{ translate( 'Find a bookkeeper' ) }
					</Button>
				</MarketingBusinessToolsFeature>

				<MarketingBusinessToolsFeature
					category={ translate( 'Sales' ) }
					title={ translate( 'Jetpack CRM' ) }
					description={ translate(
						'Jetpack CRM is the no-nonsense CRM for WordPress. Entrepreneurs earn more money when they use a good CRM, and Jetpack CRM is the simplest and most powerful of all WordPress CRMs.'
					) }
					imagePath={ jetpackLogo }
				>
					<Button onClick={ handleJetpackClick } href="https://www.jetpack.com" target="_blank">
						{ translate( 'Start with CRM' ) }
					</Button>
				</MarketingBusinessToolsFeature>
			</div>
		</Fragment>
	);
};

export default connect(
	( state ) => ( {
		selectedSiteSlug: getSelectedSiteSlug( state ),
	} ),
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingBusinessTools );
