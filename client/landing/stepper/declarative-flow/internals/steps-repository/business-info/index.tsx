import { StepContainer, NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { CheckboxControl, SelectControl, TextControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { without } from 'lodash';
import { FormEvent, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import type { Step } from '../../types';
import type { OnboardSelect, SiteSelect } from '@automattic/data-stores';
import './style.scss';

const ActionSection = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: baseline;
	flex-wrap: wrap;
	margin-top: 40px;

	@media ( max-width: 320px ) {
		align-items: center;
	}
`;

const StyledNextButton = styled( NextButton )`
	@media ( max-width: 320px ) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const BusinessInfo: Step = function ( props ) {
	const { goNext, goBack, submit } = props.navigation;

	const { __ } = useI18n();
	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);
	const siteSlug = useQuery().get( 'siteSlug' );
	const siteId = useSelect(
		( select ) => siteSlug && ( select( SITE_STORE ) as SiteSelect ).getSiteIdBySlug( siteSlug ),
		[ siteSlug ]
	);
	const settings = useSelect(
		( select ) =>
			( siteId && ( select( SITE_STORE ) as SiteSelect ).getSiteSettings( siteId ) ) || {},
		[ siteId ]
	);
	const onboardingProfile = settings?.woocommerce_onboarding_profile || {};
	const [ profileChanges, setProfileChanges ] = useState< {
		[ key: string ]: string | boolean | Array< string > | undefined;
	} >( {} );

	const { saveSiteSettings } = useDispatch( SITE_STORE );

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
		setProfileChanges( {
			...profileChanges,
			[ key ]: value,
		} );
	}

	function getProfileValue( key: string ) {
		return profileChanges[ key ] || onboardingProfile?.[ key ] || '';
	}

	const onSubmit = async ( event: FormEvent ) => {
		event.preventDefault();
		if ( siteId ) {
			const changes = {
				...profileChanges,
				[ 'completed' ]: true,
			};
			saveSiteSettings( siteId, {
				woocommerce_onboarding_profile: {
					...onboardingProfile,
					...changes,
				},
			} );
		}
		submit?.();
	};

	function getContent() {
		const productTypes = [
			{ label: __( 'Physical Products' ), value: 'physical' },
			{ label: __( 'Downloads' ), value: 'downloads' },
		];

		return (
			<>
				<div className="business-info__info-section" />
				<div className="business-info__instructions-container">
					<form onSubmit={ onSubmit }>
						<div className="business-info__components-group">
							<label className="business-info__components-group-label">
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
								{ value: '1-10', label: __( '1-10' ) },
								{ value: '11-100', label: __( '11-101' ) },
								{ value: '101-1000', label: __( '101-1000' ) },
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
								options={ [] /**getRevenueOptions( get( WOOCOMMERCE_DEFAULT_COUNTRY ) )*/ }
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
							{ /* <SupportCard /> */ }
							<StyledNextButton type="submit">{ __( 'Continue' ) }</StyledNextButton>
						</ActionSection>
					</form>
				</div>
			</>
		);
	}

	if ( ! settings ) {
		return (
			<div className="business-info__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<div className="business-info__signup is-woocommerce-install">
			<div className="business-info__is-store-address">
				<StepContainer
					stepName="business-info"
					className={ `is-step-${ intent }` }
					skipButtonAlign="top"
					goBack={ goBack }
					goNext={ goNext }
					isHorizontalLayout
					formattedHeader={
						<FormattedHeader
							id="business-info-header"
							headerText={ __( 'Tell us a bit about your business' ) }
							subHeaderText={ __( 'We will guide you to get started based on your responses.' ) }
							align="left"
						/>
					}
					stepContent={ getContent() }
					recordTracksEvent={ recordTracksEvent }
				/>
			</div>
		</div>
	);
};

export default BusinessInfo;
