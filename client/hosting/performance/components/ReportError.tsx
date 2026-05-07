import { NoticeBanner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

export const ReportError = ( { onRetestClick }: { onRetestClick(): void } ) => {
	const translate = useTranslate();

	return (
		<NoticeBanner
			level="warning"
			title={ translate( 'Results not available' ) }
			hideCloseButton
			actions={ [
				<Button key="rerun-test" variant="primary" onClick={ onRetestClick }>
					{ translate( 'Re-run test' ) }
				</Button>,
			] }
		>
			{ translate(
				'We were unable to reliably load and test your page. This could be due to a timeout, server error, or connectivity issue. ' +
					'Make sure your site is accessible and responding correctly. {{link}}Learn more about improving site speed{{/link}}, or try running the test again.',
				{
					components: {
						link: <InlineSupportLink supportContext="site-speed" showIcon={ false } />,
					},
				}
			) }
		</NoticeBanner>
	);
};
