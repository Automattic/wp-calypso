import {
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import type { PlansIntent } from '@automattic/plans-grid-next';
import './style.scss';

interface IntentToggleProps {
	currentIntent?: PlansIntent | null;
	onIntentChange: ( intent: PlansIntent ) => void;
}

export default function IntentToggle( { currentIntent, onIntentChange }: IntentToggleProps ) {
	const translate = useTranslate();

	const isWordPressHosting = currentIntent === 'plans-wordpress-hosting';
	const currentValue = isWordPressHosting ? 'wordpress-hosting' : 'website-builder';

	const handleToggle = ( value: string | number | undefined ) => {
		if ( typeof value !== 'string' ) {
			return;
		}

		const newIntent: PlansIntent =
			value === 'wordpress-hosting' ? 'plans-wordpress-hosting' : 'plans-website-builder';
		onIntentChange( newIntent );
	};

	return (
		<div className="intent-toggle">
			<ToggleGroupControl
				label={ translate( 'Plan type selector' ) }
				hideLabelFromVision
				value={ currentValue }
				onChange={ handleToggle as ( value: string | number | undefined ) => void }
			>
				<ToggleGroupControlOption
					value="website-builder"
					label={ translate( 'Website Builder' ) }
				/>
				<ToggleGroupControlOption
					value="wordpress-hosting"
					label={ translate( 'WordPress Hosting' ) }
				/>
			</ToggleGroupControl>
		</div>
	);
}
