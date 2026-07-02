import {
	ProgressBar,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';

export default function AnalysisProgress( { url }: { url: string } ) {
	return (
		<VStack spacing={ 8 } alignment="center">
			<VStack spacing={ 4 } alignment="center">
				<Text align="center" weight={ 500 }>
					{ sprintf(
						/* translators: %s is the site URL being analyzed. */
						__( 'We’re analyzing %s.' ),
						url
					) }
				</Text>
				<Text align="center" variant="muted">
					{ __(
						'This usually takes 10 to 20 minutes, depending on the size of the site and how much content there is to review.'
					) }
				</Text>
				<Text align="center" variant="muted">
					{ __(
						'The analysis will keep running in the background, and your report will be ready to view shortly. You can safely close this window and keep working.'
					) }
				</Text>
			</VStack>
			<ProgressBar />
		</VStack>
	);
}
