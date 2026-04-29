import { __ } from '@wordpress/i18n';
import type { ReactNode } from 'react';

type BenefitProps = {
	icon: ReactNode;
	title: string;
	body: ReactNode;
};

function AmplifyBenefit( { icon, title, body }: BenefitProps ) {
	return (
		<div className="amplify-landing-benefit">
			<div className="amplify-landing-benefit-icon" aria-hidden="true">
				{ icon }
			</div>
			<h3 className="amplify-landing-benefit-title">{ title }</h3>
			<p className="amplify-landing-benefit-body">{ body }</p>
		</div>
	);
}

const ICON_LENS = (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<circle cx="12" cy="12" r="3" />
		<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
	</svg>
);

const ICON_CHART = (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
		<polyline points="16 7 22 7 22 13" />
	</svg>
);

const ICON_LINK = (
	<svg
		width="22"
		height="22"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	</svg>
);

export default function AmplifyBenefits() {
	return (
		<div className="amplify-landing-benefits-grid">
			<AmplifyBenefit
				icon={ ICON_LENS }
				title={ __( 'Two lenses, one complete picture' ) }
				body={ __(
					'Amplify audits your site two ways. Human-centric analysis reveals how a potential client perceives your site when they land on it. AI analysis shows how ChatGPT, Gemini, and Perplexity read and rank your agency when someone searches for help.'
				) }
			/>
			<AmplifyBenefit
				icon={ ICON_CHART }
				title={ __( 'See problems where they actually live' ) }
				body={ __(
					'Amplify overlays directly on your live site, pinning issues in context so you can see exactly what needs fixing and why, right on the page where it matters.'
				) }
			/>
			<AmplifyBenefit
				icon={ ICON_LINK }
				title={ __( 'Audit your sites and your clients’ too' ) }
				body={ __(
					'Pull from your connected Automattic for Agencies account, or paste any URL. Amplify works for your agency site and your client sites, delivering more value at every engagement.'
				) }
			/>
		</div>
	);
}
