import { __, sprintf } from '@wordpress/i18n';
import cloudIcon from 'calypso/assets/images/jetpack/cloud-icon.svg';
import AkismetIcon from '../../../../../components/akismet-icon';
import { PageHeader } from '../../../../../components/page-header';
import JetpackDecorativeCard from '../../jetpack-decorative-card';
import type { FC } from 'react';

interface Props {
	percentDiscount: number;
	productName: string;
	isAkismet?: boolean;
}

const JetpackCancellationOfferAcceptedStep: FC< Props > = ( props ) => {
	const { percentDiscount, productName, isAkismet } = props;

	const akismetHeadline = __(
		'We’re happy you’ve chosen Akismet to protect your site against spam.'
	);
	const jetpackHeadline = __( 'We’re happy you’ve chosen Jetpack to level-up your site.' );

	return (
		<>
			{ isAkismet ? (
				<AkismetIcon className="jetpack-cancellation-offer-accepted__image" size={ 100 } />
			) : (
				<JetpackDecorativeCard iconPath={ cloudIcon } />
			) }
			<PageHeader
				title={
					/* Translators: %(brand)s is either Jetpack or Akismet */
					sprintf( __( 'Thanks for sticking with %(brand)s!' ), {
						brand: isAkismet ? 'Akismet' : 'Jetpack',
					} )
				}
				description={ sprintf(
					/* Translators: %(headline)s is already translated text; %(percentDiscount)d%% should be a percentage like 15% or 20% */
					__(
						'%(headline)s Your %(percentDiscount)d%% discount for %(productName)s will be applied next time you are billed.'
					),
					{
						headline: isAkismet ? akismetHeadline : jetpackHeadline,
						percentDiscount,
						productName,
					}
				) }
			/>
		</>
	);
};

export default JetpackCancellationOfferAcceptedStep;
