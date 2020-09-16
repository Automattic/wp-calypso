/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import type { WPCOMFeatures } from '@automattic/data-stores'
import {
	FeatureIcon,
	Title,
	SubTitle,
	ActionButtons,
	BackButton,
	SkipButton,
	NextButton,
} from '@automattic/onboarding';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { WPCOM_FEATURES_STORE } from '../../stores/wpcom-features';
import useStepNavigation from '../../hooks/use-step-navigation';

/**
 * Style dependencies
 */
import './style.scss';

type FeatureId = WPCOMFeatures.FeatureId;

const FeaturesStep: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const allFeatures = useSelect( ( select ) => select( WPCOM_FEATURES_STORE ).getAllFeatures() );

	const selectedFeatures = useSelect( ( select ) =>
		select( WPCOM_FEATURES_STORE ).getSelectedFeatures()
	);
	const { addFeature, removeFeature } = useDispatch( WPCOM_FEATURES_STORE );

	const hasSelectedFeatures = selectedFeatures.length > 0;

	const toggleFeature = ( featureId: FeatureId ) => {
		if ( selectedFeatures.includes( featureId ) ) {
			removeFeature( featureId );
		} else {
			addFeature( featureId );
		}
	};

	return (
		<div className="gutenboarding-page features">
			<div className="features__header">
				<div className="features__heading">
					<Title>{ __( 'Which features will you need?' ) }</Title>
					<SubTitle>
						{ __(
							"Choose the features that matter to you and we'll suggest a plan to suit your needs. Don't worry, you won't be charged and can change it at any time."
						) }
					</SubTitle>
				</div>
				<ActionButtons>
					<BackButton onClick={ goBack } />
					{ hasSelectedFeatures ? (
						<NextButton onClick={ goNext } />
					) : (
						<SkipButton onClick={ goNext } />
					) }
				</ActionButtons>
			</div>
			<div className="features__body">
				<div className="features__items">
					{ Object.entries( allFeatures ).map( ( [ id, feature ] ) => (
						<Button
							className={ classnames( 'features__item', {
								'is-selected': selectedFeatures.includes( feature.id ),
							} ) }
							key={ id }
							onClick={ () => toggleFeature( feature.id ) }
							isTertiary
						>
							<div className="features__item-image">
								<FeatureIcon featureId={ feature.id } />
							</div>
							<div className="features__item-heading">
								<div className="features__item-name">{ feature.name }</div>
								<div className="features__item-description">{ feature.description }</div>
							</div>
						</Button>
					) ) }
				</div>
			</div>
		</div>
	);
};

export default FeaturesStep;
