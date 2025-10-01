import {
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Notice } from '../../components/notice';

export default function ReportErrorNotice( { onRetestClick }: { onRetestClick(): void } ) {
	return (
		<Notice variant="error">
			<VStack spacing={ 4 } alignment="flex-start" expanded={ false }>
				<VStack spacing={ 1 }>
					<Text>
						<b>{ __( 'An error occurred while testing your site.' ) }</b>
					</Text>
					<Text>
						{ __( 'Try running the test again or contact support if the error persists.' ) }
					</Text>
				</VStack>
				<Button variant="primary" onClick={ onRetestClick }>
					{ __( 'Re-run test' ) }
				</Button>
			</VStack>
		</Notice>
	);
}
