import { useTranslate } from 'i18n-calypso';
import cloudIcon from 'calypso/assets/images/jetpack/cloud-icon.svg';
import FormattedHeader from 'calypso/components/formatted-header';
import JetpackDecorativeCard from 'calypso/components/jetpack-decorative-card';
import type { FC } from 'react';

interface Props {
	siteId: number;
	percentDiscount: number;
	productName: string;
}

const JetpackCancellationOfferAccepted: FC< Props > = ( props ) => {
	const translate = useTranslate();
	const { percentDiscount, productName } = props;

	return (
		<>
			<JetpackDecorativeCard iconPath={ cloudIcon } />
			<FormattedHeader
				headerText={ translate( 'Thanks for sticking with Jetpack!' ) }
				subHeaderText={
					/* Translators: %(percentDiscount)d%% should be a percentage like 15% or 20% */
					translate(
						'We’re happy you’ve chosen Jetpack to level-up your site. Your %(percentDiscount)d%% discount for %(productName)s will be applied next time you are billed.',
						{
							args: {
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
