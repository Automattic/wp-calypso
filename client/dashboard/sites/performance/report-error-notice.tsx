import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalText as Text,
	Notice,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function ReportErrorNotice( { onRetestClick }: { onRetestClick(): void } ) {
	return (
		<Notice status="error" isDismissible={ false }>
			<HStack spacing={ 2 } justify="space-between">
				<VStack spacing={ 2 }>
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
			</HStack>
		</Notice>
	);
}
