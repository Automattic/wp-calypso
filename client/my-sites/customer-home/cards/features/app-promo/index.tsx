import { useTranslate } from 'i18n-calypso';
import AppPromo from 'calypso/blocks/app-promo';
import TranslatorInvite from 'calypso/components/translator-invite';

const AppPromoHome = () => {
	const translate = useTranslate();
	return (
		<>
			<AppPromo
				title={ translate( 'Get our mobile app' ) }
				className="customer-home__card"
				subheader={ translate(
					'Everything you need to build and grow your site from any device.'
				) }
				campaign="calypso-customer-home"
			/>
			<TranslatorInvite path="/home" />
		</>
	);
};
export default AppPromoHome;
