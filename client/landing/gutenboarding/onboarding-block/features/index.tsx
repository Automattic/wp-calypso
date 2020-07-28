/**
 * External dependencies
 */
import * as React from 'react';
import { useI18n } from '@automattic/react-i18n';
import { Button } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import {
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
import featureList from './feature-list';
import useStepNavigation from '../../hooks/use-step-navigation';

/**
 * Style dependencies
 */
import './style.scss';

const FeaturesStep: React.FunctionComponent = () => {
	const { __ } = useI18n();
	const { goBack, goNext } = useStepNavigation();

	const defaultSelectedFeature: Array< string > = [];
	const [ selectedFeatures, setSelectedFeatures ] = React.useState( defaultSelectedFeature );
	const hasSelectedFeatures = selectedFeatures.length > 0;

	const toggleFeature = ( featureId: string ) => {
		if ( selectedFeatures.indexOf( featureId ) > -1 ) {
			setSelectedFeatures( selectedFeatures.filter( ( id ) => id !== featureId ) );
		} else {
			setSelectedFeatures( [ ...selectedFeatures, featureId ] );
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
					{ featureList.map( ( feature ) => (
						<Button
							className={ classnames( 'features__item', {
								'is-selected': selectedFeatures.indexOf( feature.id ) > -1,
							} ) }
							key={ feature.id }
							onClick={ () => toggleFeature( feature.id ) }
							isTertiary
						>
							<div className="features__item-image">
								<Icon icon={ feature.icon } />
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
