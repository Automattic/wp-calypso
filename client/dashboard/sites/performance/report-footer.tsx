import { __experimentalVStack as VStack, ExternalLink } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Text } from '../../components/text';

export default function ReportFooter() {
	return (
		<VStack spacing={ 4 }>
			<Text as="p">
				{ __(
					'The historical performance data and metrics presented in this site are sourced from the Google Chrome User Experience Report (CrUX) dataset, which reflects real-world user experiences and interactions with your site. Realtime data is provided by PageSpeed Insights. This data helps us provide actionable recommendations to improve your site‘s performance.'
				) }
			</Text>
			<Text as="p">
				{ __(
					'While we strive to provide accurate and helpful insights, please note that performance improvements are dependent on various factors, including your current setup and specific use case. Our recommendations aim to guide you towards potential enhancements, but results may vary.'
				) }
			</Text>
			<Text as="p">
				<ExternalLink href="https://developer.wordpress.com/docs/site-performance/speed-test/#accessing-the-speed-test-tool">
					{ __( 'Learn more about the Chrome UX Report' ) }
				</ExternalLink>
			</Text>
		</VStack>
	);
}
