import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useTranslate } from 'i18n-calypso';
import GreenCheckmark from 'calypso/assets/images/jetpack/jetpack-green-checkmark.svg';
import RedCross from 'calypso/assets/images/jetpack/jetpack-red-cross.svg';
import FoldableCard from 'calypso/components/foldable-card';
import { BUNDLE_FEATURES_LIST } from './features';
import type { FeaturesListProps } from '../types';

import './style.scss';

export const FeaturesList: React.FC< FeaturesListProps > = ( { item } ) => {
	const featuresList = BUNDLE_FEATURES_LIST[ item.productSlug ];

	const isMobile = useMobileBreakpoint();
	const translate = useTranslate();

	if ( ! featuresList ) {
		return null;
	}

	const output = (
		<div className="features-list">
			{ featuresList.map( ( { features, icon, included, slug, title } ) => (
				<div key={ slug } className="features-list__group">
					<div className="features-list__group--title">
						<img className="features-list__group--icon" alt={ title } src={ icon } />
						{ title }
					</div>
					<ul className="features-list__group--features">
						{ features.map( ( feature, index ) => (
							<li key={ index }>
								<img
									src={ included ? GreenCheckmark : RedCross }
									alt={ included ? translate( 'included' ) : translate( 'not included' ) }
								/>
								<span>{ feature }</span>
							</li>
						) ) }
					</ul>
				</div>
			) ) }
		</div>
	);

	if ( isMobile ) {
		return (
			<FoldableCard
				header={ translate( 'View all features' ) }
				clickableHeader={ true }
				hideSummary
			>
				{ output }
			</FoldableCard>
		);
	}

	return output;
};
