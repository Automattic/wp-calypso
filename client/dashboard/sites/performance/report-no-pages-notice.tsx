import { __experimentalVStack as VStack, __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export default function ReportNoPagesNotice() {
	return (
		<Notice variant="error" title={ __( 'No pages found' ) }>
			<VStack>
				<Text as="p">
					{ __(
						'We couldn’t find any pages to test yet. If you just activated hosting features, they should appear soon.'
					) }
				</Text>

				<Text as="p">{ __( 'If the issue persists, please contact support.' ) }</Text>
			</VStack>
		</Notice>
	);
}
