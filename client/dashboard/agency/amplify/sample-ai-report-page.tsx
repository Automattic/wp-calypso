import { __ } from '@wordpress/i18n';

export default function SampleAiReportPage( { isDecorative = false }: { isDecorative?: boolean } ) {
	return (
		<div className="dashboard-amplify-sample-ai-page" aria-hidden={ isDecorative || undefined }>
			<div className="dashboard-amplify-sample-ai-page__inner">
				<div className="dashboard-amplify-sample-ai-page__brand">
					<strong>AMPLIFY</strong>
					<span>{ __( 'by Automattic for Agencies' ) }</span>
				</div>
				<div className="dashboard-amplify-sample-ai-page__main">
					<div className="dashboard-amplify-sample-ai-page__mark">✳</div>
					<div className="dashboard-amplify-sample-ai-page__eyebrow">{ __( 'AI analysis' ) }</div>
					<h3>{ __( 'How AI sees this site' ) }</h3>
					<p>
						{ __(
							'A closer look at how clearly a homepage can be found and understood by AI systems.'
						) }
					</p>
				</div>
				<div className="dashboard-amplify-sample-ai-page__contents">
					<strong>{ __( 'In this report' ) }</strong>
					<span>{ __( 'Technical health' ) }</span>
					<span>{ __( 'Structured data' ) }</span>
					<span>{ __( 'Content and entity clarity' ) }</span>
				</div>
				<div className="dashboard-amplify-sample-ai-page__note">
					{ __( 'Illustrative AI report preview' ) }
				</div>
			</div>
		</div>
	);
}
