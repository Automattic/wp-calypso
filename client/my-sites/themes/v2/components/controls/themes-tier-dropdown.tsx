import { translate } from 'i18n-calypso';
import { useContext } from 'react';
import SelectDropdown from 'calypso/components/select-dropdown';
import ThemesShowcaseContext from 'calypso/my-sites/themes/v2/context/themes-showcase-context';
import { TIERS } from 'calypso/my-sites/themes/v2/data/tiers';
import { TierOption } from 'calypso/my-sites/themes/v2/types';
import './themes-tier-dropdown.scss';

const getTierText = ( selectedTier: string ) => {
	const selectedOption = TIERS.find( ( tier ) => tier.value === selectedTier )?.label ?? '';

	return translate( 'View: %s', { args: selectedOption } );
};

export default () => {
	const { tier, setTier } = useContext( ThemesShowcaseContext );

	return (
		<SelectDropdown
			className="themes__tier-dropdown"
			onSelect={ ( tier: TierOption ) => setTier( tier.value ) }
			selectedText={ getTierText( tier ) }
			options={ TIERS }
			initialSelected={ tier }
		></SelectDropdown>
	);
};
