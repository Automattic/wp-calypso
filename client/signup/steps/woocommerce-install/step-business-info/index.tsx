import { CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { without } from 'lodash';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { useDispatch, useSelector } from 'calypso/state';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ActionSection, StyledNextButton } from '..';
import SupportCard from '../components/support-card';
import {
	useSiteSettings,
	WOOCOMMERCE_DEFAULT_COUNTRY,
	WOOCOMMERCE_ONBOARDING_PROFILE,
} from '../hooks/use-site-settings';
import { getRevenueOptions } from './revenue-options';
import type { WooCommerceInstallProps } from '..';
import './style.scss';

export default function StepBusinessInfo( props: WooCommerceInstallProps ) {
	const { goToNextStep } = props;
	const { __ } = useI18n();

	const dispatch = useDispatch();
	const siteId = useSelector( getSelectedSiteId ) as number;

	const { get, save, update } = useSiteSettings( siteId );

	function updateProductTypes( type: string ) {
		const productTypes = getProfileValue( 'product_types' ) || [];

		const newTypes = productTypes.includes( type )
			? without( productTypes, type )
			: [ ...productTypes, type ];

		updateOnboardingProfile( 'product_types', newTypes );
	}

	function updateProductCount( count: string ) {
		updateOnboardingProfile( 'product_count', count );
	}

	function updateSellingVenues( venue: string ) {
		updateOnboardingProfile( 'selling_venues', venue );
	}

	function updateRevenue( revenue: string ) {
		updateOnboardingProfile( 'revenue', revenue );
	}

	function updateOtherPlatform( platform: string ) {
		updateOnboardingProfile( 'other_platform', platform );
	}

	function updateOtherPlatformName( name: string ) {
		updateOnboardingProfile( 'other_platform_name', name );
	}

	function updateOnboardingProfile( key: string, value: string | boolean | Array< string > ) {
		const onboardingProfile = get( WOOCOMMERCE_ONBOARDING_PROFILE ) || {};

		const updatedOnboardingProfile = {
			...onboardingProfile,
			[ key ]: value,
		};

		update( WOOCOMMERCE_ONBOARDING_PROFILE, updatedOnboardingProfile );
	}

	function getProfileValue( key: string ) {
		const onboardingProfile = get( WOOCOMMERCE_ONBOARDING_PROFILE ) || {};

		return onboardingProfile[ key ] || '';
	}

	function getContent() {
		const productTypes = [
			{ label: __( 'Physical Products' ), value: 'physical' },
			{ label: __( 'Downloads' ), value: 'downloads' },
		];

		return (
			<>
				<div className="step-business-info__info-section" />
				<div className="step-business-info__instructions-container">
					<form
						onSubmit={ ( e ) => {
							e.preventDefault();
							dispatch( submitSignupStep( { stepName: 'business-info' } ) );
							updateOnboardingProfile( 'completed', true );
							save();
							goToNextStep();
							return false;
						} }
					>
						<div className="step-business-info__components-group">
							<label className="step-business-info__components-group-label">
								{ __( 'What type of products will be listed? (optional)' ) }
							</label>

							{ productTypes.map( ( { label, value } ) => (
								<CheckboxControl
									label={ label }
									value={ value }
									key={ value }
									onChange={ () => updateProductTypes( value ) }
									checked={ getProfileValue( 'product_types' ).indexOf( value ) !== -1 }
								/>
							) ) }
						</div>

						<SelectControl
							label={ __( 'How many products do you plan to display? (optional)' ) }
							value={ getProfileValue( 'product_count' ) }
							options={ [
								{ value: '', label: '' },
								{ value: '0', label: __( "I don't have any products yet." ) },
								{ value: '1-10', label: __( '1–10' ) },
								{ value: '11-100', label: __( '11–101' ) },
								{ value: '101-1000', label: __( '101–1000' ) },
								{ value: '1000+', label: __( '1000+' ) },
							] }
							onChange={ updateProductCount }
						/>

						<SelectControl
							label={ __( 'Currently selling elsewhere? (optional)' ) }
							value={ getProfileValue( 'selling_venues' ) }
							options={ [
								{ value: '', label: '' },
								{ value: 'no', label: __( 'No' ) },
								{ value: 'other', label: __( 'Yes, on another platform' ) },
								{
									value: 'other-woocommerce',
									label: __( 'Yes, I own a different store powered by WooCommerce' ),
								},
								{
									value: 'brick-mortar',
									label: __( 'Yes, in person at physical stores and/or events' ),
								},
								{
									value: 'brick-mortar-other',
									label: __(
										'Yes, on another platform and in person at physical stores and/or events'
									),
								},
							] }
							onChange={ updateSellingVenues }
						/>

						{ [ 'other', 'brick-mortar', 'brick-mortar-other', 'other-woocommerce' ].includes(
							getProfileValue( 'selling_venues' )
						) && (
							<SelectControl
								label={ __( "What's your current annual revenue?" ) }
								value={ getProfileValue( 'revenue' ) }
								options={ getRevenueOptions( get( WOOCOMMERCE_DEFAULT_COUNTRY ) ) }
								onChange={ updateRevenue }
							/>
						) }

						{ [ 'other', 'brick-mortar-other' ].includes( getProfileValue( 'selling_venues' ) ) && (
							<>
								<SelectControl
									label={ __( 'Which platform is the store using? (optional)' ) }
									value={ getProfileValue( 'other_platform' ) }
									options={ [
										{ value: '', label: '' },
										{
											value: 'shopify',
											label: __( 'Shopify' ),
										},
										{
											value: 'bigcommerce',
											label: __( 'BigCommerce' ),
										},
										{
											value: 'magento',
											label: __( 'Magento' ),
										},
										{
											value: 'wix',
											label: __( 'Wix' ),
										},
										{
											value: 'amazon',
											label: __( 'Amazon' ),
										},
										{
											value: 'ebay',
											label: __( 'eBay' ),
										},
										{
											value: 'etsy',
											label: __( 'Etsy' ),
										},
										{
											value: 'squarespace',
											label: __( 'Squarespace' ),
										},
										{
											value: 'other',
											label: __( 'Other' ),
										},
									] }
									onChange={ updateOtherPlatform }
								/>

								{ getProfileValue( 'other_platform' ) === 'other' && (
									<TextControl
										label={ __( 'What is the platform name? (optional)' ) }
										onChange={ updateOtherPlatformName }
										value={ getProfileValue( 'other_platform_name' ) }
									/>
								) }
							</>
						) }

						<ActionSection>
							<SupportCard />
							<StyledNextButton type="submit">{ __( 'Continue' ) }</StyledNextButton>
						</ActionSection>
					</form>
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
			hideSkip
			headerText={ __( 'Tell us a bit about your business' ) }
			fallbackHeaderText={ __( 'Tell us a bit about your business' ) }
			subHeaderText={ __( 'We will guide you to get started based on your responses.' ) }
			fallbackSubHeaderText={ __( 'We will guide you to get started based on your responses.' ) }
			align="left"
			stepContent={ getContent() }
			isWideLayout
			{ ...props }
		/>
	);
}
