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
import { useDispatch, useSelector } from 'react-redux';
import SiteSelector from 'calypso/components/site-selector';
import StepWrapper from 'calypso/signup/step-wrapper';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
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

	const [ selectedId, setSelectedId ] = useState();

	const siteSlug = useSelector( ( state ) => getSiteSlug( state, selectedId ) );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! siteSlug || ! selectedId ) {
			return;
		}

		dispatch( submitSignupStep( { stepName: 'select-site' }, { site: siteSlug } ) );
		goToStep( 'confirm' );
	}, [ siteSlug, selectedId, goToStep, dispatch ] );

	const title = __( 'Select a site' );
	const subtitle = __( 'Pick which site you would like to use to set up your new store.' );
	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
			shouldHideNavButtons={ true }
			className="select-site__step-wrapper"
			align={ isReskinned ? 'left' : 'center' }
			isWideLayout={ isReskinned }
			headerText={ title }
			fallbackHeaderText={ title }
			subHeaderText={ subtitle }
			fallbackSubHeaderText={ subtitle }
			stepContent={
				<Card className="select-site__card">
					<SiteSelector filter={ filterSites } onSiteSelect={ setSelectedId } />
				</Card>
			}
			{ ...props }
		/>
	);
}
