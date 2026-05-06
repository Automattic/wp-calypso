import { ToggleControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';

interface Props {
	sensitive: boolean;
	onChange: ( v: boolean ) => void;
}

export function SensitiveToggle( { sensitive, onChange }: Props ) {
	const translate = useTranslate();
	return (
		<ToggleControl
			label={ translate( 'Mark media as sensitive' ) as string }
			checked={ sensitive }
			onChange={ onChange }
			__nextHasNoMarginBottom
		/>
	);
}
