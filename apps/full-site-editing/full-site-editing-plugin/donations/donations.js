/**
 * External dependencies
 */
import classNames from 'classnames';

/**
 * WordPress dependencies
 */
import { InspectorControls, __experimentalBlock as Block } from '@wordpress/block-editor';
import { Button, ExternalLink, PanelBody, ToggleControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import StripeNudge from './stripe-nudge';

const Donations = ( { attributes, products, setAttributes, siteSlug, stripeConnectUrl } ) => {
	const { oneTimePlanId, monthlyPlanId, annuallyPlanId, showCustomAmount } = attributes;
	const [ activeTab, setActiveTab ] = useState( 'one-time' );

	const isTabActive = ( tab ) => activeTab === tab;

	useEffect( () => {
		if ( ! oneTimePlanId ) {
			setAttributes( { oneTimePlanId: products[ 'one-time' ] } );
		}
	}, [ oneTimePlanId ] );

	return (
		<Block.div>
			{ stripeConnectUrl && <StripeNudge stripeConnectUrl={ stripeConnectUrl } /> }
			<div className="donations__container">
				{ ( monthlyPlanId || annuallyPlanId ) && (
					<div className="donations__tabs">
						<Button
							className={ classNames( { 'is-active': isTabActive( 'one-time' ) } ) }
							onClick={ () => setActiveTab( 'one-time' ) }
						>
							{ __( 'One-Time', 'full-site-editing' ) }
						</Button>
						{ monthlyPlanId && (
							<Button
								className={ classNames( { 'is-active': isTabActive( 'monthly' ) } ) }
								onClick={ () => setActiveTab( 'monthly' ) }
							>
								{ __( 'Monthly', 'full-site-editing' ) }
							</Button>
						) }
						{ annuallyPlanId && (
							<Button
								className={ classNames( { 'is-active': isTabActive( 'annually' ) } ) }
								onClick={ () => setActiveTab( 'annually' ) }
							>
								{ __( 'Annually', 'full-site-editing' ) }
							</Button>
						) }
					</div>
				) }
				<div className="donations__content">
					<div>
						{ isTabActive( 'one-time' ) && __( 'Make a one-time donation', 'full-site-editing' ) }
						{ isTabActive( 'monthly' ) && __( 'Make a monthly donation', 'full-site-editing' ) }
						{ isTabActive( 'annually' ) && __( 'Make a yearly donation', 'full-site-editing' ) }
					</div>
					{ showCustomAmount && (
						<div>{ __( 'Or enter a custom amount', 'full-site-editing' ) } </div>
					) }
				</div>
			</div>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'full-site-editing' ) }>
					<ToggleControl
						checked={ !! monthlyPlanId }
						onChange={ ( showMonthlyDonations ) => {
							setAttributes( {
								monthlyPlanId: showMonthlyDonations ? products[ '1 month' ] : null,
							} );
						} }
						label={ __( 'Show monthly donations', 'full-site-editing' ) }
					/>
					<ToggleControl
						checked={ !! annuallyPlanId }
						onChange={ ( showAnnuallyDonations ) => {
							setAttributes( {
								annuallyPlanId: showAnnuallyDonations ? products[ '1 year' ] : null,
							} );
						} }
						label={ __( 'Show annual donations', 'full-site-editing' ) }
					/>
					<ToggleControl
						checked={ showCustomAmount }
						onChange={ ( newShowCustomAmountValue ) => {
							setAttributes( {
								showCustomAmount: newShowCustomAmountValue,
							} );
						} }
						label={ __( 'Show custom amount option', 'full-site-editing' ) }
					/>
					<ExternalLink href={ `https://wordpress.com/earn/payments/${ siteSlug }` }>
						{ __( 'View donation earnings', 'full-site-editing' ) }
					</ExternalLink>
				</PanelBody>
			</InspectorControls>
		</Block.div>
	);
};

export default Donations;
