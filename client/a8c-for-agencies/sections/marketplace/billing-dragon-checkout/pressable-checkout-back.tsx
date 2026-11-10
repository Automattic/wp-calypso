import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { arrowLeft } from '@wordpress/icons';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function PressableCheckoutBack( {
	cancelUrl,
	isFormSubmitting,
}: {
	cancelUrl: string;
	isFormSubmitting: boolean;
} ) {
	const dispatch = useDispatch();
	return (
		<Button
			__next40pxDefaultSize
			variant="tertiary"
			icon={ arrowLeft }
			href={ cancelUrl }
			disabled={ isFormSubmitting }
			onClick={ () =>
				dispatch( recordTracksEvent( 'calypso_a4a_pressable_checkout_back', { use_beacon: true } ) )
			}
		>
			{ __( 'Back to Pressable' ) }
		</Button>
	);
}
