import { __experimentalText as Text, __experimentalHStack as HStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

function CaptureStatusIndicator( { capturing }: { capturing: boolean } ) {
	return (
		<span
			style={ {
				width: '8px',
				height: '8px',
				borderRadius: '50%',
				flex: '0 0 auto',
				backgroundColor: capturing
					? 'var(--dashboard__foreground-color-success)'
					: 'var(--color-border-subtle)',
			} }
			role="status"
			aria-label={ capturing ? __( 'Capturing' ) : __( 'Not capturing' ) }
		/>
	);
}

export default function BackendSubtitle( { capturing }: { capturing: boolean } ) {
	return (
		<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
			<CaptureStatusIndicator capturing={ capturing } />
			<Text variant="muted">
				{ capturing
					? __( 'Capturing performance data.' )
					: __( 'Capturing is off. Start capturing to collect performance data for your site.' ) }
			</Text>
		</HStack>
	);
}
