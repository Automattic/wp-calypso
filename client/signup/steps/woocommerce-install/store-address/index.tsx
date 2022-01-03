import { Button } from '@automattic/components';
import { TextControl } from '@wordpress/components';
import { useI18n } from '@wordpress/react-i18n';
import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import SupportCard from '../components/support-card';
import { ActionSection, StyledNextButton } from '../confirm';
import { useStoreAddressOptions } from '../hooks/use-site-options';
import useWooCommerceOnPlansEligibility from '../hooks/use-woop-handling';
import type { WooCommerceInstallProps } from '..';
import './style.scss';

export default function Confirm( props: WooCommerceInstallProps ): ReactElement | null {
	const { goToStep, isReskinned, headerTitle, headerDescription } = props;
	const { __ } = useI18n();

	const siteId = useSelector( getSelectedSiteId ) as number;

	const { wpcomDomain } = useWooCommerceOnPlansEligibility( siteId );

	const { get, save, clean, update } = useStoreAddressOptions( siteId );

	function getContent() {
		return (
			<>
				<div className="store-address__info-section" />
				<div className="store-address__instructions-container">
					<TextControl
						label={ __( 'Address line 1', 'woocommerce-admin' ) }
						value={ get( 'address_1' ) }
						onChange={ ( value ) => update( { address_1: value } ) }
					/>

					<TextControl
						label={ __( 'Address line 2', 'woocommerce-admin' ) }
						value={ get( 'address_2' ) }
						onChange={ ( value ) => update( { address_2: value } ) }
					/>

					<TextControl
						label={ __( 'Postcode', 'woocommerce-admin' ) }
						value={ get( 'postcode' ) }
						onChange={ ( value ) => update( { postcode: value } ) }
					/>

					<Button onClick={ clean }>Clean</Button>

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
			<div className="store-address__info-section">
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
