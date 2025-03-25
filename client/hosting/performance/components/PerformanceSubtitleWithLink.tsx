import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';

export const PerformanceSubtitleWithLink = () => {
	const translate = useTranslate();

	const link = isA8CForAgencies() ? (
		<a
			href="https://agencieshelp.automattic.com/knowledge-base/check-your-sites-performance"
			target="_blank"
			rel="noreferrer"
		/>
	) : (
		<InlineSupportLink supportContext="site-performance" showIcon={ false } />
	);

	return translate(
		'Optimize your site for lightning-fast performance. {{link}}Learn more.{{/link}}',
		{
			components: {
				link,
			},
		}
	);
};
