import {
	Button,
	Notice,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import usePressableReturn from './use-pressable-return';
import type { ReturnParams } from './lib';

import './style.scss';

function PressableReturnContent( params: ReturnParams ) {
	const dispatch = useDispatch();
	const { isError, retry } = usePressableReturn( params );

	if ( ! isError ) {
		return (
			<Text as="p" size={ 16 } align="center" variant="muted" role="status">
				{ __( 'Finishing the purchase and returning to Pressable.' ) }
			</Text>
		);
	}

	return (
		<VStack spacing={ 4 } alignment="center">
			<Notice status="error" isDismissible={ false }>
				{ __( 'We couldn’t return you to Pressable. Try again.' ) }
			</Notice>
			<Button
				variant="primary"
				onClick={ () => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_pressable_checkout_return_retry', {
							checkout_status: 'SUCCESS',
						} )
					);
					retry();
				} }
			>
				{ __( 'Try again' ) }
			</Button>
		</VStack>
	);
}

export default function PressableReturn( params: ReturnParams ) {
	return (
		<Layout className="pressable-return" title={ __( 'Return to Pressable' ) } wide>
			<LayoutBody>
				<PressableReturnContent { ...params } />
			</LayoutBody>
		</Layout>
	);
}
