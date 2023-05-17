import { Card } from '@automattic/components';
import { ToggleControl } from '@wordpress/components';
import { useDoNotSellContent } from 'calypso/blocks/do-not-sell-dialog/use-do-not-sell-content';
import SectionHeader from 'calypso/components/section-header';
import { useDoNotSell } from 'calypso/lib/analytics/utils';

export const DoNotSellSetting = () => {
	const { shouldSeeDoNotSell, isDoNotSell, onSetDoNotSell } = useDoNotSell();
	const { title, toggleLabel, longDescription } = useDoNotSellContent();

	if ( ! shouldSeeDoNotSell ) {
		return null;
	}

	return (
		<>
			<SectionHeader label={ title } />
			<Card className="privacy__settings">
				{ longDescription }
				<hr />
				<ToggleControl checked={ isDoNotSell } onChange={ onSetDoNotSell } label={ toggleLabel } />
			</Card>
		</>
	);
};
