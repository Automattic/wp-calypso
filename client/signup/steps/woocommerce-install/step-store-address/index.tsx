import { TextControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import FormCountrySelect from 'calypso/components/forms/form-country-select';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import { ActionSection, StyledNextButton } from '../confirm';
import {
	useSiteSettings,
	WOOCOMMERCE_STORE_ADDRESS_1,
	WOOCOMMERCE_STORE_ADDRESS_2,
	WOOCOMMERCE_STORE_CITY,
	WOOCOMMERCE_DEFAULT_COUNTRY,
	WOOCOMMERCE_STORE_POSTCODE,
} from '../hooks/use-site-settings';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '..';
import type { ChangeEventHandler } from 'react';
import './style.scss';

export default function StepStoreAddress( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const { wpcomDomain } = useWooCommerceOnPlansEligibility( siteId );

	const { get, save, update, countriesList } = useSiteSettings( siteId );

	const handleCountryChange: ChangeEventHandler< HTMLInputElement > = ( event ) => {
		update( WOOCOMMERCE_DEFAULT_COUNTRY, event.target.value );
	};

	function getContent() {
		return (
			<>
				<div className="step-store-address__info-section" />
				<div className="step-store-address__instructions-container">
					<TextControl
						label={ __( 'Address line 1', 'woocommerce-admin' ) }
						value={ get( WOOCOMMERCE_STORE_ADDRESS_1 ) }
						onChange={ ( value ) => update( WOOCOMMERCE_STORE_ADDRESS_1, value ) }
					/>

					<TextControl
						label={ __( 'Address line 2', 'woocommerce-admin' ) }
						value={ get( WOOCOMMERCE_STORE_ADDRESS_2 ) }
						onChange={ ( value ) => update( WOOCOMMERCE_STORE_ADDRESS_2, value ) }
					/>

					<FormCountrySelect
						name="country_code"
						value={ get( WOOCOMMERCE_DEFAULT_COUNTRY ) }
						onChange={ handleCountryChange }
						countriesList={ countriesList }
					/>

					<TextControl
						label={ __( 'City', 'woocommerce-admin' ) }
						value={ get( WOOCOMMERCE_STORE_CITY ) }
						onChange={ ( value ) => update( WOOCOMMERCE_STORE_CITY, value ) }
					/>

					<TextControl
						label={ __( 'Postcode', 'woocommerce-admin' ) }
						value={ get( WOOCOMMERCE_STORE_POSTCODE ) }
						onChange={ ( value ) => update( WOOCOMMERCE_STORE_POSTCODE, value ) }
					/>

					<ActionSection>
						<SupportCard />
						<StyledNextButton
							onClick={ () => {
								save();
								goToStep( 'confirm' );
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
			<div className="step-store-address__info-section">
				<LoadingEllipsis />
			</div>
		);
	}

	return (
		<StepWrapper
			flowName="woocommerce-install"
			hideSkip={ true }
			nextLabelText={ __( 'Confirm' ) }
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
