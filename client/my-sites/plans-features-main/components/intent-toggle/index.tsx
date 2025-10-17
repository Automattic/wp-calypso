import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { PlansIntent } from '@automattic/plans-grid-next';
import './style.scss';

interface IntentToggleProps {
	currentIntent?: PlansIntent | null;
	onIntentChange: ( intent: PlansIntent ) => void;
}

export default function IntentToggle( { currentIntent, onIntentChange }: IntentToggleProps ) {
	const translate = useTranslate();
	const handleToggle = ( value: string | number | undefined ) => {
		if ( typeof value !== 'string' ) {
			return;
		}

		const newIntent: PlansIntent =
			value === 'plans-wordpress-hosting' ? value : 'plans-website-builder';

		recordTracksEvent( 'calypso_plans_intent_toggle_change', {
			plans_intent: newIntent,
		} );

		onIntentChange( newIntent );
	};

	// Properly typed onChange handler for ToggleGroupControl
	const handleToggleGroupChange: ( value: string | number | undefined ) => void = handleToggle;

	return (
		<div className="plans-grid-next__intent-toggle">
			<ToggleGroupControl
				isBlock
				label={ translate( 'Plan type selector' ) }
				hideLabelFromVision
				value={ currentIntent || '' }
				onChange={ handleToggleGroupChange }
				__next40pxDefaultSize
				__nextHasNoMarginBottom
			>
				<ToggleGroupControlOption
					value="plans-website-builder"
					label={ translate( 'Website builder' ) }
				/>
				<ToggleGroupControlOption
					value="plans-wordpress-hosting"
					label={ translate( 'WordPress hosting' ) }
				/>
			</ToggleGroupControl>
		</div>
	);
}
