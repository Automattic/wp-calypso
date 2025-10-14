import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export default function ReportNoPagesNotice() {
	return (
		<Notice variant="error" title={ __( 'No pages found' ) }>
			<Text as="p">
				{ __(
					'We couldn’t find any pages yet. If you just activated hosting features, they should appear soon.'
				) }
			</Text>
		</Notice>
	);
}
