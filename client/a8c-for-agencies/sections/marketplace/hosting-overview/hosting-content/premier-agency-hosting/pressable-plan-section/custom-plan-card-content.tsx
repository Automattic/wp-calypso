import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT } from 'calypso/a8c-for-agencies/components/a4a-contact-support-widget';
import PressableLogo from 'calypso/assets/images/a8c-for-agencies/pressable-logo.svg';

type Props = {
	isReferralMode?: boolean;
};

export default function CustomPlanCardContent( { isReferralMode }: Props ) {
	const translate = useTranslate();

	return (
		<div className="pressable-plan-card-content">
			<div className="pressable-plan-card-content__top">
				<img className="pressable-plan-card-content__logo" src={ PressableLogo } alt="Pressable" />

				<div className="pressable-plan-card-content__price">
					<b className="pressable-plan-card-content__price-actual-value">
						{ translate( 'Custom pricing' ) }
					</b>
				</div>
			</div>

			<Button
				className="pressable-plan-card-content__cta-button"
				variant="primary"
				href={ CONTACT_URL_HASH_FRAGMENT_WITH_PRODUCT }
			>
				{ isReferralMode ? translate( 'Contact us to refer' ) : translate( 'Contact us' ) }
			</Button>
		</div>
	);
}
