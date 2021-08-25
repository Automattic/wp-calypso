/**
 * External dependencies
 */
import { Button } from '@automattic/components';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

/**
 * Internal dependencies
 */
import './tabbed-plans-style.scss';

function TabbedPlans( { onUpgradeClick } ) {
	const tabList = [ 'Limited', 'Professional' ];
	const bothPlansProfessional = [
		'Unlimited posts/pages/products',
		'World class 24/7 support',
		'Custom domain (free for first year)',
		'WordPress.com ads removed',
		'Ability to sell products/services',
		'Earn ad revenue',
		'Video hosting',
		'Google Analytics',
		'MailChimp integration',
	];
	const bothPlansLimited = [
		'Both plans feature 1',
		'Both plans feature 2',
		'Both plans feature 3',
		'Both plans feature 4',
		'Both plans feature 5',
	];
	const featureComparisonProfessional = [
		{ featureName: 'Install plugins', planOne: 'None', planTwo: '58,000+ Available' },
		{ featureName: 'Themes available', planOne: '25', planTwo: '8,000 to choose from' },
		{ featureName: 'SEO', planOne: 'Simple', planTwo: 'Advanced for better ranking' },
		{ featureName: 'Storage', planOne: '100GB (for images and video)', planTwo: '200GB' },
		{ featureName: 'WooCommerce fees', planOne: '5.5% + 30c', planTwo: '3.9% + 30c' },
	];
	const featureComparisonLimited = [
		{ featureName: 'Install plugins', planOne: 'None', planTwo: 'None' },
		{ featureName: 'Themes available', planOne: '5', planTwo: '10' },
		{ featureName: 'SEO', planOne: 'Simple', planTwo: 'Simple' },
		{ featureName: 'Storage', planOne: '3GB (for images and video)', planTwo: '10GB' },
		{ featureName: 'WooCommerce fees', planOne: '10% + 30c', planTwo: '8% + 30c' },
	];
	const planDetailsProfessional = [
		{
			planName: 'WordPress Premium',
			price: 12,
			cta: 'Start with Premium',
			productId: 1003,
			productSlug: 'value-bundle',
		},
		{
			planName: 'WordPress Plus',
			price: 48,
			cta: 'Start with Plus',
			productId: 1008,
			productSlug: 'business-bundle',
		},
	];
	const planDetailsLimited = [
		{
			planName: 'WordPress Limited',
			price: 0,
			cta: 'Start with Limited',
			productSlug: null,
			productId: null,
		},
		{
			planName: 'WordPress Personal',
			price: 4,
			cta: 'Start with Personal',
			productId: 1009,
			productSlug: 'personal-bundle',
		},
	];

	const [ bothPlansItems, setBothPlansItems ] = useState( bothPlansProfessional );
	const [ featureComparison, setFeatureComparison ] = useState( featureComparisonProfessional );
	const [ planDetails, setPlanDetails ] = useState( planDetailsProfessional );
	const [ selectedTab, setSelectedTab ] = useState( 'Professional' );

	const toggleTab = () =>
		selectedTab === 'Professional' ? setSelectedTab( 'Limited' ) : setSelectedTab( 'Professional' );

	const handleUpgradeButtonClick = ( productSlug, productId ) => {
		if ( productSlug === null ) {
			onUpgradeClick( null );
		} else {
			onUpgradeClick( { product_slug: productSlug, product_id: productId } );
		}
	};

	useEffect( () => {
		if ( selectedTab === 'Professional' ) {
			setBothPlansItems( bothPlansProfessional );
			setPlanDetails( planDetailsProfessional );
			setFeatureComparison( featureComparisonProfessional );
		} else {
			setBothPlansItems( bothPlansLimited );
			setPlanDetails( planDetailsLimited );
			setFeatureComparison( featureComparisonLimited );
		}
	}, [ selectedTab ] );

	// ** Things to handle:
	// * 	- whether the user added a domain in the prior step
	// * 	- Handle Monthly / Annually toggles

	return (
		<Grid className="tabbed-plans__grid-container">
			<TabContainer>
				{ tabList.map( ( item, index ) =>
					item === selectedTab ? (
						<SelectedTab className={ `tabbed-plans__tab-${ index + 1 }` } onClick={ toggleTab }>
							{ item }
						</SelectedTab>
					) : (
						<Tab className={ `tabbed-plans__tab-${ index + 1 }` } onClick={ toggleTab }>
							{ item }
						</Tab>
					)
				) }
			</TabContainer>
			{ planDetails.map( ( item, index ) => (
				<React.Fragment key={ `planDetails${ index }` }>
					<PlanHeader
						key={ `planHeader${ index }` }
						className={ `tabbed-plans__header-${ index + 1 }` }
					>
						{ item.planName }
					</PlanHeader>
					<Price key={ `planPrice${ index }` } className={ `tabbed-plans__price-${ index + 1 }` }>
						${ item.price } /mo
					</Price>
					<CtaButton
						key={ `planCta${ index }` }
						className={ `tabbed-plans__button-${ index + 1 }` }
						onClick={ () => handleUpgradeButtonClick( item.productSlug, item.productId ) }
					>
						{ item.cta }
					</CtaButton>
				</React.Fragment>
			) ) }

			{ featureComparison.map( ( item, index ) => (
				<React.Fragment key={ `feature${ index }` }>
					<FeatureTitle
						key={ `featureTitle${ index }` }
						className={ `tabbed-plans__feature-title-${ index + 1 }` }
					>
						{ item.featureName }
					</FeatureTitle>
					<Feature
						key={ `featureItemOne${ index }` }
						className={ `tabbed-plans__feature-1-${ index + 1 }` }
					>
						{ item.planOne }
					</Feature>
					<Feature
						key={ `featureItemTwo${ index }` }
						className={ `tabbed-plans__feature-2-${ index + 1 }` }
					>
						{ item.planTwo }
					</Feature>
				</React.Fragment>
			) ) }

			<BothPlans>
				<BothPlansHeader>Included with both plans:</BothPlansHeader>
				{ bothPlansItems.map( ( item, index ) => (
					<BothPlansItem key={ `bothItems${ index }` }>{ item }</BothPlansItem>
				) ) }
			</BothPlans>
		</Grid>
	);
}

TabbedPlans.propTypes = {
	onUpgradeClick: PropTypes.func,
};

export default TabbedPlans;

const CtaButton = styled( Button )`
	border: 1px solid black;
	margin: 30px 30px 0 0;
	padding: 10px 36px;
	font-weight: 600;
`;

const Feature = styled.div`
	margin-bottom: 10px;
`;

const FeatureTitle = styled.h2`
	margin-left: 36px;
	font-weight: 600;
`;

const Grid = styled.div`
	border-bottom: 1px solid black;
	border-left: 1px solid black;
	border-right: 1px solid black;
	padding: 0 0 36px 0;
`;
const PlanHeader = styled.div`
	margin-top: 20px;
	font-size: 25px;
`;

const Price = styled.div`
	font-size: 36px;
	padding: 36px 0;
	font-weight: 600;
`;

const BothPlans = styled.div`
	grid-area: both-plans;
	border-left: 1px solid #ddd;
	margin: 20px;
	padding-left: 20px;
`;

const BothPlansHeader = styled.h2`
	font-size: 20px;
	margin-bottom: 20px;
`;

const BothPlansItem = styled.p`
	font-size: 1rem;
	margin: 0 0 5px 0;
`;

const TabContainer = styled.ul`
	grid-area: tabs;
	display: flex;
	flex-flow: row nowrap;
	justify-content: flex-start;
	align-items: flex-end;
	border-bottom: 1px solid black;
	margin: 0 -2px -1px -1px;
	border-left: 1px solid white;
	border-right: 1px solid white;
	padding-left: 20px;
`;

const Tab = styled.li`
	padding: 6px 36px;
	list-style: none;
	background-color: #dddddd;
	border: 1px solid black;
	margin: 0 -1px -1px -1px;
`;

const SelectedTab = styled( Tab )`
	background-color: #fff;
	border-bottom: 1px solid white;
	margin: 0 -1px -1px -1px;
`;
