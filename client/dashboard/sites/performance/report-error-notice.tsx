import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import InlineSupportLink from '../../components/inline-support-link';
import { Notice, NoticeActionButton } from '../../components/notice';

export default function ReportErrorNotice( { onRetestClick }: { onRetestClick: () => void } ) {
	return (
		<Notice
			variant="error"
			title={ __( 'Results not available' ) }
			actions={
				<NoticeActionButton variant="solid" onClick={ onRetestClick }>
					{ __( 'Re-run test' ) }
				</NoticeActionButton>
			}
		>
			{ createInterpolateElement(
				__(
					'We were unable to reliably load and test your page. This could be due to a timeout, server error, or connectivity issue. Make sure your site is accessible and responding correctly. <link>Learn more about improving site speed</link>, or try running the test again.'
				),
				{
					link: <InlineSupportLink supportContext="site-speed" />,
				}
			) }
		</Notice>
	);
}
