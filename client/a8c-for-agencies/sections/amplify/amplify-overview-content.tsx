import './style.scss';

import { __ } from '@wordpress/i18n';
import AmplifyScoreCard from './amplify-score-card';
import AmplifySiteSelect from './amplify-site-select';

export default function AmplifyOverviewContent() {
	return (
		<div className="amplify-landing">
			<section className="amplify-landing-hero">
				<div className="amplify-landing-hero-text">
					<h1 className="amplify-landing-h1">
						{ __( 'Your agency’s website needs to win more clients' ) }
					</h1>
					<p className="amplify-landing-sub">
						{ __(
							'First impressions happen fast, and the way clients find you is changing. AI tools now help businesses discover agencies before a single conversation happens. Amplify audits your site through both lenses, then generates precise, agent-ready prompts so you can elevate your site instantly, captivate prospects, and close more deals.'
						) }
					</p>
					<AmplifySiteSelect />
				</div>
				<div className="amplify-landing-hero-visual">
					<AmplifyScoreCard />
				</div>
			</section>
		</div>
	);
}
