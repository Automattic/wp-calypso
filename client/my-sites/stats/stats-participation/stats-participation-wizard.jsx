/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Panel, PanelRow, PanelBody } from '@wordpress/components';
// import classNames from 'classnames';
// import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import StatsParticipationSVG from './stats-participation-svg';
import './styles.scss';

const ProductCard = ( { site } ) => {
	const [ subscriptionValue, setSubscriptionValue ] = useState( 0 );
	const [ wizardStep, setWizardStep ] = useState( 0 );
	const [ siteType, setSiteType ] = useState( null );

	const handleTypeClick = ( type ) => {
		setSiteType( type );
		setWizardStep( 1 );
	};

	return (
		<div className="stats-participation-wizard">
			<Card className="jetpack-upsell-card">
				<div className="stats-participation-wizard__card">
					<div className="left">
						<Panel
							header="Jetpack Stats"
							// title={ siteType ? siteType + " site" : "What site type is groovydomain.com?" }
						>
							<PanelBody
								title={ `What site type is ${ site }?` }
								initialOpen
								opened={ wizardStep === 0 }
							>
								<PanelRow>
									<div className="type">
										<h3>Personal</h3>
										<p>
											Sites and blogs used for hobby or personal use. Doesn't generate any money in
											a direct or an indirect way.
										</p>
										<Button isSecondary onClick={ () => handleTypeClick( 'Personal' ) }>
											Personal site
										</Button>
									</div>
									<div className="type">
										<h3>Commercial</h3>
										<p>
											Sites and blogs used for commercial activities. Includes selling or
											advertising a product/service, person or business.
										</p>
										<Button isSecondary onClick={ () => handleTypeClick( 'Commercial' ) }>
											Commercial site
										</Button>
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
										</div>

										<p class="average-price">The average person pays $6 per month</p>

										<div class="benefits">
											{ subscriptionValue === 0 ? (
												<ul class="not-included">
													<li>No access to upcoming features</li>
													<li>No priority support</li>
													<li>You’ll see upsells and ads in the Stats page</li>
												</ul>
											) : (
												<ul class="included">
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
											<div class="qualifications">
												<p>
													<strong>Please confirm non-commercial usage by checking each box:</strong>
												</p>
												<ul>
													<li>
														<label>
															<input
																type="checkbox"
																// bind:group={ qualifications }
																// name={ qualifications }
																value="ads"
															/>
															I don’t have ads on my site
														</label>
													</li>
													<li>
														<label>
															<input
																type="checkbox"
																// bind:group={ qualifications }
																// name={ qualifications }
																value="products"
															/>
															I don’t sell products/services on my site
														</label>
													</li>
													<li>
														<label>
															<input
																type="checkbox"
																// bind:group={ qualifications }
																// name={ qualifications }
																value="site"
															/>
															I don’t promote a business on my site
														</label>
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
											<button disabled={ siteType === 'Personal' }>
												Continue with Jetpack Stats for free
											</button>
										) : (
											<button>Get Jetpack Stats for ${ subscriptionValue } per month</button>
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
						/>
					</div>
				</div>
			</Card>
		</div>
	);
};

const StatsParticipationWizzard = () => {
	return <ProductCard />;
};

export default StatsParticipationWizzard;
