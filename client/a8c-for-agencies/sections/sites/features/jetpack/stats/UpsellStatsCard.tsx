import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import StatsImage from 'calypso/assets/images/jetpack/rna-image-stats.png';
import JetpackRnaActionCard from 'calypso/components/jetpack/card/jetpack-rna-action-card';
import { Site } from '../../../types';

import './style.scss';

type Props = {
	site: Site;
};

const UpsellStatsCard = ( { site }: Props ) => {
	const translate = useTranslate();

	const title = translate( 'Stats' );
	const description = translate(
		'Track your site visits and other valuable insights, so you can drive more traffic to your website.'
	);
	const features = useMemo(
		() => [
			translate( 'Explore real‑time data on visitors, likes, and comments.' ),
			translate( 'Get detailed insights on the referrers that bring traffic to your site.' ),
			translate( 'Discover what countries your visitors are coming from.' ),
			translate( 'Measure link clicks, video plays, and file downloads within your site.' ),
			translate(
				'See who is creating the most popular content on your team with our author metrics.'
			),
			translate( 'And so much more.' ),
		],
		[ translate ]
	);
	const footerText = translate(
		'Commercial sites require a paid plan, which comes with priority support and access to advanced features.'
	);
	const primaryUrl = site?.url
		? `https://${ site.url }/wp-admin/plugin-install.php?s=jetpack&tab=search&type=term`
		: '';

	return (
		<JetpackRnaActionCard
			headerText={ title }
			subHeaderText={ description }
			onCtaButtonClick={ () => {} }
			ctaButtonURL={ primaryUrl }
			ctaButtonLabel={ translate( 'Get Jetpack Stats' ) }
			ctaButtonExternal
			cardImage={ StatsImage }
			cardImageAlt={ translate( 'Jetpack Stats Logo' ) }
			secondaryCtaLabel={ translate( 'Learn More' ) }
			secondaryCtaURL="https://jetpack.com/stats/"
			secondaryCtaExternal
			wrapperClass="upsell-stats-card__wrapper"
		>
			<ul className="upsell-stats-card__features">
				{ !! features?.length &&
					features.map( ( feature, i ) => (
						<li className="upsell-stats-card__features-item" key={ i }>
							<Gridicon size={ 18 } icon="checkmark" />
							{ feature }
						</li>
					) ) }
			</ul>
			<div className="upsell-stats-card__footer">{ footerText }</div>
		</JetpackRnaActionCard>
	);
};

export default UpsellStatsCard;
