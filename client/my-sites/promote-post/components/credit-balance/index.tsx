import './style.scss';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { translate } from 'i18n-calypso';
import InfoPopover from 'calypso/components/info-popover';
import InlineSupportLink from 'calypso/components/inline-support-link';
import useCreditBalanceQuery from 'calypso/data/promote-post/use-promote-post-credit-balance-query';

const CreditBalance = () => {
	const creditBalance = useCreditBalanceQuery();
	const { data: balance } = creditBalance;

	if ( ! balance || balance === '0.00' ) {
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
