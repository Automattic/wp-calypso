import { __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function LeadMatchingPlaceholder() {
	return (
		<VStack className="partner-directory-lead-matching-placeholder">
			<Text as="h2">{ __( 'Lead matching' ) }</Text>
			<Text>
				{ __(
					'This section is now wired for rollout. The final lead matching form will land in a follow-up PR.'
				) }
			</Text>
		</VStack>
	);
}
