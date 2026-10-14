import { Button, Notice, Spinner, __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { LayoutWithGuidedTour as Layout } from 'calypso/a8c-for-agencies/components/layout/layout-with-guided-tour';
import LayoutTop from 'calypso/a8c-for-agencies/components/layout/layout-with-payment-notification';
import LayoutBody from 'calypso/layout/hosting-dashboard/body';
import LayoutHeader, { LayoutHeaderTitle as Title } from 'calypso/layout/hosting-dashboard/header';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import usePressableReturn from './use-pressable-return';
import type { ReturnParams } from './lib';

function PressableReturnContent( params: ReturnParams ) {
	const dispatch = useDispatch();
	const { isError, retry } = usePressableReturn( params );

	if ( ! isError ) {
		return <Spinner aria-label={ __( 'Returning to Pressable…' ) } />;
	}

	return (
		<VStack spacing={ 4 }>
			<Notice status="error" isDismissible={ false }>
				{ __( 'We couldn’t return you to Pressable. Try again.' ) }
			</Notice>
			<Button
				variant="primary"
				onClick={ () => {
					dispatch(
						recordTracksEvent( 'calypso_a4a_pressable_checkout_return_retry', {
							checkout_status: params.canceled === '1' ? 'CANCELED' : 'SUCCESS',
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
	const title = __( 'Return to Pressable' );
	return (
		<Layout title={ title } wide>
			<LayoutTop>
				<LayoutHeader>
					<Title>{ title }</Title>
				</LayoutHeader>
			</LayoutTop>
			<LayoutBody>
				<PressableReturnContent { ...params } />
			</LayoutBody>
		</Layout>
	);
}
