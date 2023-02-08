import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useDispatch } from 'react-redux';
import { useDoNotSellContent } from 'calypso/blocks/do-not-sell-dialog/use-do-not-sell-content';
import SectionHeader from 'calypso/components/section-header';
import { useDoNotSell } from 'calypso/lib/analytics/utils';
import { saveUserSettings } from 'calypso/state/user-settings/actions';

export const DoNotSellSetting = () => {
	const { shouldSeeDoNotSell, isDoNotSell, onSetDoNotSell } = useDoNotSell();
	const { title, toggleLabel, longDescription } = useDoNotSellContent();
	const dispatch = useDispatch();

	const handleDoNotSellToggle = ( isChecked: boolean ) => {
		onSetDoNotSell( isChecked );
		dispatch( saveUserSettings( { advertising_targeting_opt_out: isChecked } ) );
	};

	if ( ! shouldSeeDoNotSell ) {
		return null;
	}

	return (
		<>
			<SectionHeader label={ title } />
			<Card className="privacy__settings">
				{ longDescription }
				<hr />
				<ToggleControl
					checked={ isDoNotSell }
					onChange={ handleDoNotSellToggle }
					label={ toggleLabel }
				/>
			</Card>
		</>
	);
};
