import { useTranslate } from 'i18n-calypso';
import cloudIcon from 'calypso/assets/images/jetpack/cloud-icon.svg';
import AkismetIcon from 'calypso/components/akismet-icon';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackDecorativeCard from 'calypso/components/jetpack-decorative-card';
import type { FC } from 'react';

interface Props {
	siteId: number;
	percentDiscount: number;
	productName: string;
	isAkismet?: boolean;
}

const JetpackCancellationOfferAccepted: FC< Props > = ( props ) => {
	const translate = useTranslate();
	const { percentDiscount, productName, isAkismet } = props;

	const akismetHeadline = translate(
		'We’re happy you’ve chosen Akismet to protect your site against spam.'
	);
	const jetpackHeadline = translate( 'We’re happy you’ve chosen Jetpack to level-up your site.' );

	return (
		<>
			{ isAkismet ? (
				<AkismetIcon className="jetpack-cancellation-offer-accepted__image" size={ 100 } />
			) : (
				<JetpackDecorativeCard iconPath={ cloudIcon } />
			) }
			<FormattedHeader
				headerText={
					/* Translators: %(brand)s is either Jetpack or Akismet */
					translate( 'Thanks for sticking with %(brand)s!', {
						args: { brand: isAkismet ? 'Akismet' : 'Jetpack' },
					} )
				}
				subHeaderText={
					/* Translators: %(headline)s is already translated text; %(percentDiscount)d%% should be a percentage like 15% or 20% */
					translate(
						`%(headline)s Your %(percentDiscount)d%% discount for %(productName)s will be applied next time you are billed.`,
						{
							args: {
								headline: isAkismet ? akismetHeadline : jetpackHeadline,
								percentDiscount,
								productName,
							},
						}
					)
				}
				align="center"
				isSecondary
			/>
		</>
	);
};

export default JetpackCancellationOfferAccepted;
