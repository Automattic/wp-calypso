import {
	isFreePlan,
	isPremiumPlan,
	isPersonalPlan,
	isEcommercePlan,
	isBusinessPlan,
} from '@automattic/calypso-products';
import { Card } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement, useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import type { WooCommerceInstallProps } from '../';

import './style.scss';

interface Site {
	capabilities: {
		manage_options: boolean;
	};
	jetpack: boolean;
	plan: {
		product_slug: string;
	};
}

export default function SelectSite( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned } = props;
	const { __ } = useI18n();

	// todo: we should allow any (non jetpack, non p2) site to show up here,
	// and push people through the checkout step as needed
	const filterSites = ( site: Site ) => {
		return (
			site.capabilities.manage_options &&
			( isFreePlan( site.plan.product_slug ) ||
				isPersonalPlan( site.plan.product_slug ) ||
				isPremiumPlan( site.plan.product_slug ) ||
				isBusinessPlan( site.plan.product_slug ) ||
				isEcommercePlan( site.plan.product_slug ) )
		);
	};

	const [ selectedSiteId, setSelectedSiteId ] = useState();

	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! selectedSiteId ) {
			return;
		}
		dispatch( submitSignupStep( { stepName: 'select-site' }, { siteId: selectedSiteId } ) );
		goToStep( 'confirm' );
	}, [ selectedSiteId, goToStep, dispatch ] );

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			allowBackFirstStep={ true }
			backUrl="/woocommerce-installation"
			className="select-site__step-wrapper"
			align={ isReskinned ? 'left' : 'center' }
			isWideLayout={ isReskinned }
			stepContent={
				<Card className="select-site__card">
					<SiteSelector filter={ filterSites } onSiteSelect={ setSelectedSiteId } />
				</Card>
			}
			{ ...props }
		/>
	);
}
