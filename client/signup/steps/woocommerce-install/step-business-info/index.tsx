import { SelectControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import { ActionSection, StyledNextButton } from '../confirm';
import { useSiteSettings, WOOCOMMERCE_ONBOARDING_PROFILE } from '../hooks/use-site-settings';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '..';
import './style.scss';

export default function StepBusinessInfo( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const { wpcomDomain } = useWooCommerceOnPlansEligibility( siteId );

	const { get, save, update } = useSiteSettings( siteId );

	function updateProductTypes( type: string ) {
		updateOnboardingProfile( 'product_type', type );
	}

	function updateProductCount( count: string ) {
		updateOnboardingProfile( 'product_count', count );
	}

	function updateSellingVenues( venue: string ) {
		updateOnboardingProfile( 'selling_venues', venue );
	}

	function updateOnboardingProfile( key: string, value: string|boolean ) {
		const profile_data = get( WOOCOMMERCE_ONBOARDING_PROFILE );

		profile_data[ key ] = value;

		update( WOOCOMMERCE_ONBOARDING_PROFILE, profile_data );
	}

	function getContent() {
		const profile_data = get( WOOCOMMERCE_ONBOARDING_PROFILE );

		return (
			<>
				<div className="step-business-info__info-section" />
				<div className="step-business-info__instructions-container">
					<SelectControl
						label={ __( 'What type of products will be listed?', 'woocommerce-admin' ) }
						value={ profile_data?.product_types[0] }
						options={ [
							{ label: 'physical', value: __( 'Physical Products', 'woocommerce-admin' ) },
							{ label: 'downloads', value: __( 'Downloads', 'woocommerce-admin' ) },
							{ label: 'subscriptions', value: __( 'Subscriptions', 'woocommerce-admin' ) },
						] }
						onChange={ updateProductTypes }
					/>

					<SelectControl
						label={ __( 'How many products do you plan to display?', 'woocommerce-admin' ) }
						value={ profile_data?.product_count[0] }
						options={ [
							{ label: '0', value: __( "I don't have any products yet.", 'woocommerce-admin' ) },
							{ label: '1-10', value: __( '1-10', 'woocommerce-admin' ) },
							{ label: '11-100', value: __( '11-101', 'woocommerce-admin' ) },
							{ label: '101-1000', value: __('101-1000', 'woocommerce-admin' ) },
							{ label: '1000+', value: __( '1000+', 'woocommerce-admin' ) },
						] }
						onChange={ updateProductCount }
					/>

					<SelectControl
						label={ __( 'Currently selling elsewhere?', 'woocommerce-admin' ) }
						value={ profile_data?.selling_venues[0] }
						options={ [
							{ label: 'no', value: __( 'No', 'woocommerce-admin' ) },
							{ label: 'other', value: __( 'Yes, on another platform', 'woocommerce-admin' ) },
							{ label: 'other-woocommerce', value: __( 'Yes, I own a different store powered by WooCommerce', 'woocommerce-admin' ) },
							{ label: 'brick-mortar', value: __( 'Yes, in person at physical stores and/or events', 'woocommerce-admin' ) },
							{ label: 'brick-mortar-other', value: __( 'Yes, on another platform and in person at physical stores and/or events', 'woocommerce-admin' ) },
						] }
						onChange={ updateSellingVenues }
					/>

					<ActionSection>
						<SupportCard />
						<StyledNextButton
							onClick={ () => {
								updateOnboardingProfile( 'completed', true );
								save();
								goToStep( 'store-address' );
							} }
						>
							{ __( 'Continue' ) }
						</StyledNextButton>
					</ActionSection>
				</div>
			</>
		);
	}

	if ( ! siteId ) {
		return (
			<div className="step-business-info__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Continue' ) }
			allowBackFirstStep={ true }
			backUrl={ `/woocommerce-installation/${ wpcomDomain }` }
			headerText={ headerTitle }
			fallbackHeaderText={ headerTitle }
			subHeaderText={ headerDescription }
			fallbackSubHeaderText={ headerDescription }
			align={ isReskinned ? 'left' : 'center' }
			stepContent={ getContent() }
			isWideLayout={ isReskinned }
			{ ...props }
		/>
	);
}
