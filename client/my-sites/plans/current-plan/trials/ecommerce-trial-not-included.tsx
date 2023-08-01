import { localize, translate } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import connect from 'calypso/assets/images/plans/wpcom/ecommerce-trial/connect.png';
import launch from 'calypso/assets/images/plans/wpcom/ecommerce-trial/launch.png';
import promote from 'calypso/assets/images/plans/wpcom/ecommerce-trial/promote.png';
import shipping from 'calypso/assets/images/plans/wpcom/ecommerce-trial/shipping2.png';
import FeatureNotIncludedCard from '../feature-not-included-card';

interface Props {
	translate: typeof translate;
}
const ECommerceTrialIncludedFeatures: FunctionComponent< Props > = ( props ) => {
	const { translate } = props;

	const notIncluded = [
		{
			title: translate( 'Launch your store to the world' ),
			text: translate( 'Once you upgrade, you can publish your store and start taking orders.' ),
			illustration: launch,
		},
		{
			title: translate( 'Promote your products' ),
			text: translate(
				'Advertise and sell on popular marketplaces and social media platforms using your product catalog.'
			),
			illustration: promote,
		},
		{
			title: translate( 'Connect with your customers' ),
			text: translate(
				'Get access to email features that let you communicate with your customers and prospects.'
			),
			illustration: connect,
		},
		{
			title: translate( 'Integrate top shipping carriers' ),
			text: translate(
				'Customize your shipping rates, print labels right from your store, and more.'
			),
			illustration: shipping,
		},
	];

	return (
		<>
			{ notIncluded.map( ( feature ) => (
				<FeatureNotIncludedCard
					key={ feature.title }
					illustration={ feature.illustration }
					title={ feature.title }
					text={ feature.text }
				></FeatureNotIncludedCard>
			) ) }
		</>
	);
};

export default localize( ECommerceTrialIncludedFeatures );
