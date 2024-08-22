import { useTranslate } from 'i18n-calypso';

import './style.scss';

export const Disclaimer = () => {
	const translate = useTranslate();

	return (
		<div className="l-block-wrapper">
			<div className="performance-profiler-disclaimer">
				<div className="content">
					{ translate(
						"The historical performance data and metrics presented in this site are sourced from the Google Chrome User Experience Report (CrUX) dataset, which reflects real-world user experiences and interactions with your site. Realtime data is provided by PageSpeed Insights. This data helps us provide actionable recommendations to improve your site's performance.{{br}}{{/br}}{{br}}{{/br}}While we strive to provide accurate and helpful insights, please note that performance improvements are dependent on various factors, including your current setup and specific use case. Our recommendations aim to guide you towards potential enhancements, but results may vary.",
						{ components: { br: <br /> } }
					) }
				</div>
				<div className="link">
					<a href="https://developer.chrome.com/docs/crux" target="_blank" rel="noreferrer">
						{ translate( 'Learn more about the Chrome UX Report ↗' ) }
					</a>
				</div>
			</div>
		</div>
	);
};
