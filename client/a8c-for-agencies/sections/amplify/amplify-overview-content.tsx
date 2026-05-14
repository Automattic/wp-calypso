import './style.scss';

import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { A4A_AGENCY_TIER_LINK } from 'calypso/a8c-for-agencies/components/sidebar-menu/lib/constants';
import AmplifyAiWorkflow from './amplify-ai-workflow';
import AmplifyBenefits from './amplify-benefits';
import AmplifyHowItWorks from './amplify-how-it-works';
import AmplifyScoreCard from './amplify-score-card';
import AmplifySiteSelect from './amplify-site-select';

// Mock monthly usage — will be sourced from the agency's tier in a follow-up.
const REMAINING_AUDITS = 1;
const MONTHLY_AUDIT_LIMIT = 3;

type Props = {
	onSiteSelected: ( url: string ) => void;
};

export default function AmplifyOverviewContent( { onSiteSelected }: Props ) {
	return (
		<div className="amplify-landing">
			<section className="amplify-landing-hero">
				<div className="amplify-landing-hero-text">
					<h1 className="amplify-landing-h1">
						{ createInterpolateElement(
							__( 'Your agency’s website<br />needs to win more clients' ),
							{ br: <br /> }
						) }
					</h1>
					<p className="amplify-landing-sub">
						{ __(
							'First impressions happen fast, and the way clients find you is changing. AI tools now help businesses discover agencies before a single conversation happens. Amplify audits your site through both lenses, then generates precise, agent-ready prompts so you can elevate your site instantly, captivate prospects, and close more deals.'
						) }
					</p>
					<AmplifySiteSelect onSiteSelected={ onSiteSelected } />
					<p className="amplify-landing-usage">
						{ sprintf(
							/* translators: %1$d is the number of audits remaining, %2$d is the monthly limit. */
							__( '%1$d of %2$d audits remaining this month.' ),
							REMAINING_AUDITS,
							MONTHLY_AUDIT_LIMIT
						) }{ ' ' }
						<a className="amplify-landing-usage-link" href={ A4A_AGENCY_TIER_LINK }>
							{ __( 'View your tier limits' ) }
						</a>
					</p>
				</div>
				<div className="amplify-landing-hero-visual">
					<AmplifyScoreCard />
				</div>
			</section>
			<section className="amplify-landing-benefits">
				<AmplifyBenefits />
			</section>
			<section className="amplify-landing-how-section">
				<AmplifyHowItWorks />
			</section>
			<section className="amplify-landing-workflow-section">
				<AmplifyAiWorkflow />
			</section>
		</div>
	);
}
