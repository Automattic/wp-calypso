import { SelectDropdown } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getOptionLabel } from 'calypso/landing/subscriptions/helpers';
import { useSelector } from 'calypso/state';
import { getThemeTiers } from 'calypso/state/themes/selectors';

export default function ThemeTierDropdown( { onSelect, selectedTier } ) {
	const translate = useTranslate();
	const themeTiers = useSelector( getThemeTiers );

	const options = [
		{ value: 'all', label: translate( 'All' ) },
		...Object.keys( themeTiers ).map( ( tier ) => ( { value: tier, label: tier } ) ),
	];

	return (
		<SelectDropdown
			className="section-nav-tabs__dropdown"
			initialSelected={ selectedTier }
			onSelect={ onSelect }
			options={ options }
			selectedText={ translate( 'View: %s', {
				args: getOptionLabel( options, selectedTier ) || '',
			} ) }
		/>
	);
}
