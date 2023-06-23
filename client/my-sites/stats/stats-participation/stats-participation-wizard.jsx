/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, CheckboxControl, Card, Panel, PanelRow, PanelBody } from '@wordpress/components';
// import classNames from 'classnames';
// import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import StatsParticipationSVG from './stats-participation-svg';
import './styles.scss';

const COMPONENT_NAME = 'stats-participation-wizard';

const ProductCard = ( { siteSlug } ) => {
	const [ subscriptionValue, setSubscriptionValue ] = useState( 6 );
	const [ wizardStep, setWizardStep ] = useState( 0 );
	const [ siteType, setSiteType ] = useState( null );

	const handleTypeClick = ( type ) => {
		setSiteType( type );
		setWizardStep( 1 );
	};

	const toggleFirstStep = ( toggleState ) => {
		// Never close on click but allow to open when a type was selected (to change).
		if ( ! siteType || ! toggleState ) {
			return;
		}

		setWizardStep( 0 );
	};

	return (
		<div className={ COMPONENT_NAME }>
			<Card className="jetpack-upsell-card">
				<div className={ `${ COMPONENT_NAME }__card` }>
					<div className="left">
						<Panel
							header="Jetpack Stats"
							// title={ siteType ? siteType + " site" : "What site type is groovydomain.com?" }
						>
							<PanelBody
								title={ `What site type is ${ siteSlug }?` }
								initialOpen
								onToggle={ ( shouldOpen ) => toggleFirstStep( shouldOpen ) }
								// onClick={ () => toggleFirstStep() }
								opened={ wizardStep === 0 }
							>
								<PanelRow>
									<div className={ `${ COMPONENT_NAME }__card-grid` }>
										<div className={ `${ COMPONENT_NAME }__card-grid-header--left` }>
											<h3>Personal</h3>
										</div>
										<div className={ `${ COMPONENT_NAME }__card-grid-header--right` }>
											<h3>Commercial</h3>
										</div>
										<div className={ `${ COMPONENT_NAME }__card-grid-body--left` }>
											<p>
												Sites and blogs used for hobby or personal use. Doesn't generate any money
												in a direct or an indirect way.
											</p>
										</div>
										<div className={ `${ COMPONENT_NAME }__card-grid-body--right` }>
											<p>
												Sites and blogs used for commercial activities. Includes selling or
												advertising a product/service, person or business.
											</p>
										</div>
										<div className={ `${ COMPONENT_NAME }__card-grid-action--left` }>
											<Button isPrimary onClick={ () => handleTypeClick( 'Personal' ) }>
												Personal site
											</Button>
										</div>
										<div className={ `${ COMPONENT_NAME }__card-grid-action--right` }>
											<Button isPrimary onClick={ () => handleTypeClick( 'Commercial' ) }>
												Commercial site
											</Button>
										</div>
									</div>
								</PanelRow>
							</PanelBody>
							<PanelBody title="What is Jetpack Stats worth to you?" opened={ wizardStep === 1 }>
								<PanelRow>
									<div>
										<div>
											<span>Slider test</span>
											<Button isSecondary onClick={ () => setSubscriptionValue( 0 ) }>
												$0
											</Button>
											<Button isSecondary onClick={ () => setSubscriptionValue( 10 ) }>
												$10
											</Button>
											<Button isSecondary onClick={ () => setSubscriptionValue( 30 ) }>
												$30
											</Button>
											<Button isSecondary onClick={ () => setSubscriptionValue( 45 ) }>
												$45
											</Button>
											<Button isSecondary onClick={ () => setSubscriptionValue( 90 ) }>
												$90
											</Button>
										</div>

										<p className="average-price">The average person pays $6 per month</p>

										<div className="benefits">
											{ subscriptionValue === 0 ? (
												<ul className="not-included">
													<li>No access to upcoming features</li>
													<li>No priority support</li>
													<li>You’ll see upsells and ads in the Stats page</li>
												</ul>
											) : (
												<ul className="included">
													<li>Instant access to upcoming features</li>
													<li>Priority support</li>
													<li>Ad-free experience</li>
													{ subscriptionValue >= 90 && (
														<li>You’re one of the top supporters — thank you!</li>
													) }
												</ul>
											) }
										</div>

										{ subscriptionValue === 0 && (
											<div className="qualifications">
												<p>
													<strong>Please confirm non-commercial usage by checking each box:</strong>
												</p>
												<ul>
													<li>
														<CheckboxControl
															type="checkbox"
															// bind:group={ qualifications }
															// name={ qualifications }
															value="ads"
															label="I don’t have ads on my site"
															onChange={ () => {} }
														/>
													</li>
													<li>
														<CheckboxControl
															type="checkbox"
															// bind:group={ qualifications }
															// name={ qualifications }
															value="products"
															label="I don’t sell products/services on my site"
															onChange={ () => {} }
														/>
													</li>
													<li>
														<CheckboxControl
															type="checkbox"
															// bind:group={ qualifications }
															// name={ qualifications }
															value="site"
															label="I don’t promote a business on my site"
															onChange={ () => {} }
														/>
													</li>
												</ul>
												<p>
													If your site doesn’t meet these criteria,{ ' ' }
													<a href="#" onClick={ () => setWizardStep( 0 ) }>
														you will need to use the commercial plan
													</a>
													.
												</p>
											</div>
										) }

										<p>
											By clicking the button below, you agree to our{ ' ' }
											<a href="#">Terms of Service</a> and to <a href="#">share details</a> with
											WordPress.com.
										</p>

										{ subscriptionValue === 0 ? (
											// TODO: disbale if some checkboxes are not checked
											<Button isPrimary disabled={ siteType !== 'Personal' }>
												Continue with Jetpack Stats for free
											</Button>
										) : (
											<Button isPrimary>
												Get Jetpack Stats for ${ subscriptionValue } per month
											</Button>
										) }
									</div>
								</PanelRow>
							</PanelBody>
						</Panel>
					</div>
					<div className="right">
						<StatsParticipationSVG
							isFree={ subscriptionValue === 0 }
							hasHighlight={ subscriptionValue >= 40 }
							extraMessage={ subscriptionValue >= 90 }
						/>
					</div>
				</div>
			</Card>
		</div>
	);
};

const StatsParticipationWizzard = ( { siteSlug } ) => {
	return <ProductCard siteSlug={ siteSlug } />;
};

export default StatsParticipationWizzard;
