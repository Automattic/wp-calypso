/**
 * WordPress dependencies
 */
import {
	Button,
	PanelBody,
	PanelRow,
	SelectControl,
	TextControl,
	ExternalLink,
	Placeholder,
	Spinner,
} from '@wordpress/components';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { CURRENCY_OPTIONS } from '.';

const API_STATE_NOT_REQUESTING = 0;
const API_STATE_REQUESTING = 1;

/**
 * @typedef {object} PlanAttributes
 * @property { string } newPlanCurrency
 * @property { string } newPlanName
 * @property { number } newPlanPrice
 * @property { string } newPlanInterval
 *
 * @typedef {object} Currency
 * @property { string } label
 * @property { string } symbol
 *
 * @typedef {object} Props
 * @property { PlanAttributes } attributes
 * @property { (attributes: Partial<PlanAttributes>) => void } setAttributes
 * @property { string } className
 * @property { (attributes: PlanAttributes, onComplete:(isSuccesful: boolean)=>void) => void } savePlan
 * @property { Currency[] } currencies
 * @property { string } siteSlug
 *
 * @param { Props } props
 */
export default function Inspector( props ) {
	const [ apiState, setApiState ] = useState( API_STATE_NOT_REQUESTING );
	const { attributes, setAttributes, className, savePlan, currencies, siteSlug } = props;

	return (
		<InspectorControls>
			{ siteSlug && (
				<ExternalLink
					href={ `https://wordpress.com/earn/payments/${ siteSlug }` }
					className={ 'wp-block-premium-content-container---link-to-earn' }
				>
					{ __( 'Manage your subscriptions.', 'full-site-editing' ) }
				</ExternalLink>
			) }
			<PanelBody
				title="Add a new subscription"
				initialOpen
				className={ `${ className }---settings-add_plan` }
			>
				{ apiState === API_STATE_REQUESTING && (
					<Placeholder
						icon="lock"
						label={ __( 'Premium Content', 'full-site-editing' ) }
						instructions={ __( 'Saving plan…', 'full-site-editing' ) }
					>
						<Spinner />
					</Placeholder>
				) }
				{ apiState === API_STATE_NOT_REQUESTING && (
					<div>
						<PanelRow className="plan-name">
							<TextControl
								id="new-plan-name"
								label="Name"
								value={ attributes.newPlanName }
								onChange={ ( set ) => setAttributes( { newPlanName: set } ) }
							/>
						</PanelRow>
						<PanelRow className="plan-price">
							<SelectControl
								label="Currency"
								onChange={ ( set ) => setAttributes( { newPlanCurrency: set } ) }
								value={ attributes.newPlanCurrency }
								options={ CURRENCY_OPTIONS }
							></SelectControl>
							<TextControl
								label="Price"
								value={ attributes.newPlanPrice }
								onChange={ ( set ) => setAttributes( { newPlanPrice: parseFloat( set ) } ) }
								type="number"
							></TextControl>
						</PanelRow>
						<PanelRow className="plan-interval">
							<SelectControl
								label="Interval"
								onChange={ ( set ) => setAttributes( { newPlanInterval: set } ) }
								value={ attributes.newPlanInterval }
								options={ [
									{ label: 'Month', value: '1 month' },
									{ label: 'Year', value: '1 year' },
								] }
							></SelectControl>
						</PanelRow>
						<PanelRow>
							<Button
								// @ts-ignore isSecondary is missing from the type definition
								isSecondary
								isLarge
								onClick={
									/**
									 * @param { import('react').MouseEvent<HTMLElement> } e
									 */
									( e ) => {
										e.preventDefault();
										setApiState( API_STATE_REQUESTING );
										savePlan( props.attributes, ( success ) => {
											setApiState( API_STATE_NOT_REQUESTING );
											if ( success ) {
												setAttributes( { newPlanPrice: 5 } );
												setAttributes( { newPlanName: '' } );
											}
										} );
									}
								}
							>
								{ __( 'Add subscription', 'full-site-editing' ) }
							</Button>
						</PanelRow>
					</div>
				) }
			</PanelBody>
		</InspectorControls>
	);
}
