import { NoticeBanner } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

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
				'An error occurred while testing your site. Try running the test again or contact support if the error persists.'
			) }
		</NoticeBanner>
	);
};
