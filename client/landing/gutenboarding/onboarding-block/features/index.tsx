/**
 * External dependencies
 */
import * as React from 'react';
import { useDispatch, useSelect } from '@wordpress/data';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import type { WPCOMFeatures } from '@automattic/data-stores';
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
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { WPCOM_FEATURES_STORE } from '../../stores/wpcom-features';
import useStepNavigation from '../../hooks/use-step-navigation';
import { useTrackStep } from '../../hooks/use-track-step';

/**
 * Style dependencies
 */
import './style.scss';

type FeatureId = WPCOMFeatures.FeatureId;

const FeaturesStep: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const allFeatures = useSelect( ( select ) => select( WPCOM_FEATURES_STORE ).getAllFeatures() );

	const selectedFeatures = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedFeatures() );
	const { addFeature, removeFeature } = useDispatch( ONBOARD_STORE );

	const hasSelectedFeatures = selectedFeatures.length > 0;
	const hasSelectedVideoStorage = selectedFeatures.includes( 'video-storage' );

	const toggleFeature = ( featureId: FeatureId ) => {
		if ( selectedFeatures.includes( featureId ) ) {
			removeFeature( featureId );
		} else {
			addFeature( featureId );
		}
	};

	// Keep a copy of the selected domain locally so it's available when the component is unmounting
	const hasSelectedFeaturesRef = React.useRef< boolean >();
	const hasSelectedVideoStorageRef = React.useRef< boolean >();
	React.useEffect( () => {
		hasSelectedFeaturesRef.current = hasSelectedFeatures;
		hasSelectedVideoStorageRef.current = hasSelectedVideoStorage;
	}, [ hasSelectedFeatures, hasSelectedVideoStorage ] );

	useTrackStep( 'Features', () => ( {
		has_selected_features: hasSelectedFeaturesRef.current,
		has_selected_video_storage: hasSelectedVideoStorageRef.current,
	} ) );

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
							data-e2e-button={ `feature-${ id }` }
						>
							<div className="features__item-image">
								<FeatureIcon featureId={ feature.id } />
							</div>
							<div className="features__item-heading">
								<div className="features__item-name">{ getFeatureText( feature.id, __ ).name }</div>
								<div className="features__item-description">
									{ getFeatureText( feature.id, __ ).description }
								</div>
							</div>
						</Button>
					) ) }
				</div>
			</div>
		</div>
	);
};

function getFeatureText( featureId: FeatureId, __: ReturnType< typeof useI18n >[ '__' ] ) {
	switch ( featureId ) {
		case 'domain':
			return {
				name: __( 'Custom domains' ),
				description: __( 'Help your site stand out. The first year is free with a plan.' ),
			};
		case 'store':
			return {
				name: __( 'Store' ),
				description: __(
					'Sell unlimited products or services with a powerful, flexible online store.'
				),
			};
		case 'seo':
			return {
				name: __( 'SEO tools' ),
				description: __( 'Boost your SEO and connect a Google Analytics account.' ),
			};
		case 'plugins':
			return {
				name: __( 'Plugins' ),
				description: __( 'Install plugins to extend the power of your site.' ),
			};
		case 'ad-free':
			return {
				name: __( 'Ad-free' ),
				description: __( 'Remove advertisements and own your brand.' ),
			};
		case 'image-storage':
			return {
				name: __( 'Image storage' ),
				description: __( 'Extended storage space for hi-res images.' ),
			};
		case 'video-storage':
			return {
				name: __( 'Video storage' ),
				description: __( 'Host your own ad-free videos' ),
			};
		case 'support':
			return {
				name: __( 'Priority support' ),
				description: __( 'Chat with an expert live.' ),
			};
	}
}

export default FeaturesStep;
