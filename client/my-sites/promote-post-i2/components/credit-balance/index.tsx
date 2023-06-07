import { memo } from '@wordpress/element';
import { translate, numberFormat } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

interface Props {
	balance?: number;
}

const CreditBalance = ( { balance }: Props ) => {
	if ( balance === undefined || balance === 0 ) {
		return null;
	}

	return (
		<div className="promote-post-i2__aux-wrapper">
			<div className="empty-promotion-list__container">
				<h3 className="empty-promotion-list__title wp-brand-font">
					${ numberFormat( balance, 2 ) }
				</h3>
				<p className="empty-promotion-list__body">
					{ translate(
						'Available credits that will be automatically applied toward your next campaigns. {{learnMoreLink}}Learn more.{{/learnMoreLink}}',
						{
							components: {
								learnMoreLink: (
									<InlineSupportLink supportContext="blaze_credits" showIcon={ false } />
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
