import './style.scss';
import { memo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { BlazeCreditStatus, useBlazeCredits } from 'calypso/lib/promote-post';

const CreditBalance = () => {
	const [ balance ] = useState( 200 ); // Todo: Fetch balance from the API
	const creditsEnabled = useBlazeCredits() === BlazeCreditStatus.ENABLED;

	if ( ! balance || ! creditsEnabled ) {
		return null;
	}

	const tooltipText = translate(
		'Available credits that will be automatically applied toward your next campaigns. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
		{
			components: {
				learnMoreLink: <InlineSupportLink supportContext="blaze_credits" showIcon={ false } />,
			},
		}
	);

	return (
		<div className="credit-balance__nav-item">
			{ __( `Credits: ` ) + `$${ balance }` }
			<InfoPopover
				className="credit-balance__help-icon"
				icon="help-outline"
				position="right"
				iconSize={ 18 }
				showOnHover={ true }
			>
				{ tooltipText }
			</InfoPopover>
		</div>
	);
};

export default memo( CreditBalance );
