import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactElement } from 'react';
import ThankYou, { ThankYouCtaType } from './thank-you';

const ThankYouCta: ThankYouCtaType = ( {
	dismissUrl,
	jetpackSearchCustomizeUrl,
	recordThankYouClick,
} ) => {
	const translate = useTranslate();
	return (
		<>
			<Button
				primary
				href={ jetpackSearchCustomizeUrl }
				onClick={ () => recordThankYouClick( 'search', 'customizer' ) }
			>
				{ translate( 'Customize Search' ) }
			</Button>
			<Button href={ dismissUrl }>{ translate( 'Skip for now' ) }</Button>
		</>
	);
};

const SearchProductThankYou = (): ReactElement => {
	const translate = useTranslate();
	return (
		<ThankYou
			illustration="/calypso/images/illustrations/thankYou.svg"
			ThankYouCtaComponent={ ThankYouCta }
			title={ translate( 'Welcome to Jetpack Search!' ) }
		>
			<>
				<p>{ translate( 'We are currently indexing your site.' ) }</p>
				<p>
					{ translate(
						'In the meantime, we have configured Jetpack Search on your site — ' +
							'you should try customizing it in your traditional WordPress dashboard.'
					) }
				</p>
			</>
		</ThankYou>
	);
};

export default SearchProductThankYou;
