import config from '@automattic/calypso-config';
import { memo } from '@wordpress/element';
import { translate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

interface Props {
	balance?: string;
}

const CreditBalance = ( { balance = '0.00' }: Props ) => {
	// Hide the section if balance is invalid or is 0
	if ( ! balance || balance === '0.00' ) {
		return null;
	}

	const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );

	return (
		<div className="promote-post-i2__aux-wrapper">
			<div className="empty-promotion-list__container">
				<h3 className="empty-promotion-list__title wp-brand-font">${ balance }</h3>
				<p className="empty-promotion-list__body">
					{ translate(
						'Available credits that will be automatically applied toward your next campaigns. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink
										supportContext="blaze_credits"
										showIcon={ false }
										showSupportModal={ ! isRunningInJetpack }
									/>
								),
							},
						}
					) }
				</p>
			</div>
		</div>
	);
};

export default memo( CreditBalance );
