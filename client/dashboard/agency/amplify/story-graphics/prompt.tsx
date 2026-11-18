import { __ } from '@wordpress/i18n';

import './prompt.scss';

/** An AI chat prompt turning the report into a pitch deck. */
export default function PromptGraphic() {
	return (
		<div className="dashboard-amplify-story__prompt" aria-hidden="true">
			<p>
				<span>
					{ __(
						'Turn this report into a 5-slide pitch deck in our agency’s voice, leading with the three biggest gaps.'
					) }
				</span>
				<span className="dashboard-amplify-story__prompt-caret" />
			</p>
			<div className="dashboard-amplify-story__prompt-actions">
				<span className="dashboard-amplify-story__prompt-attachment">
					<span className="dashboard-amplify-story__prompt-file">{ __( 'PDF' ) }</span>
					<span>prospect-report.pdf</span>
				</span>
				<span className="dashboard-amplify-story__prompt-send">↑</span>
			</div>
		</div>
	);
}
