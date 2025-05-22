import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Disclaimer() {
	return (
		<div>
			<Text as="p" variant="muted" style={ { margin: '16px 0' } }>
				{ __(
					'The historical performance data and metrics presented in this site are sourced from the Google Chrome User Experience Report (CrUX) dataset, which reflects real-world user experiences and interactions with your site. Realtime data is provided by PageSpeed Insights. This data helps us provide actionable recommendations to improve your site‘s performance.'
				) }
			</Text>
			<Text as="p" variant="muted" style={ { marginBottom: '16px' } }>
				{ __(
					'While we strive to provide accurate and helpful insights, please note that performance improvements are dependent on various factors, including your current setup and specific use case. Our recommendations aim to guide you towards potential enhancements, but results may vary.'
				) }
			</Text>
			<a href="https://developer.chrome.com/docs/crux" target="_blank" rel="noreferrer">
				{ __( 'Learn more about the Chrome UX Report ↗' ) }
			</a>
		</div>
	);
}
