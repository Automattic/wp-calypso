import { useTranslate } from 'i18n-calypso';

export default function LeadMatchingPlaceholder() {
	const translate = useTranslate();

	return (
		<div className="partner-directory-lead-matching-placeholder">
			<h2>{ translate( 'Lead matching' ) }</h2>
			<p>
				{ translate(
					'This section is now wired for rollout. The final lead matching form will land in a follow-up PR.'
				) }
			</p>
		</div>
	);
}
