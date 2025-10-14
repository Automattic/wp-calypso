import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export default function ReportNoPagesNotice() {
	return (
		<Notice variant="error" title={ __( 'No pages found' ) }>
			<Text as="p">
				{ __(
					'We couldn’t find any pages to test yet. If you just activated hosting features, they should appear soon. If the issue persists, please contact support.'
				) }
			</Text>

			<Text as="p">{ __( 'If the issue persists, please contact support.' ) }</Text>
		</Notice>
	);
}
