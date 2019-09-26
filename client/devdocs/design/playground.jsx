/** @format */
/**
 * External dependencies
 */
import React from 'react';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import DocumentHead from 'components/data/document-head';
import Main from 'components/main';
import NavTabs from 'components/section-nav/tabs';
import NavItem from 'components/section-nav/item';
import SectionNav from 'components/section-nav';
import PlanFeaturesHeader from 'my-sites/plan-features/header';

/**
 * Style Dependencies
 */
import 'my-sites/plan-features/style.scss';
import './plans-prototype.scss';

class DesignAssets extends React.Component {
	static displayName = 'DesignAssets';

	render() {
		const className = classnames( 'devdocs', 'devdocs__components', {
			'is-single': true,
			'is-list': ! this.props.component,
		} );

		return (
			/* eslint-disable wpcalypso/jsx-classname-namespace */ // disable for prototyping
			<Main className={ className }>
				<DocumentHead title="Plans" />

				<SectionNav>
					<NavTabs label="Section" selectedText="Plans">
						<NavItem path="#" selected={ false }>
							My Plan
						</NavItem>
						<NavItem path="#" selected={ true }>
							Plans
						</NavItem>
						<NavItem path="#" selected={ false }>
							Domains
						</NavItem>
						<NavItem path="#" selected={ false }>
							Email
						</NavItem>
					</NavTabs>
				</SectionNav>

				<div className="plans-prototype">
					<Card className="plans-prototype__plan">
						<PlanFeaturesHeader
							availableForPurchase={ true }
							current={ true }
							currencyCode="USD"
							isJetpack={ false }
							popular={ false }
							newPlan={ false }
							bestValue={ false }
							title="Premium"
							planType="value_bundle"
							rawPrice={ 8 }
							discountPrice={ null }
							billingTimeFrame="per month, billed annually"
							hideMonthly={ false }
							isPlaceholder={ false }
							basePlansPath={ null }
							relatedMonthlyPlan={ null }
							isInSignup={ false }
							selectedPlan={ null }
						/>

						<p class="plan-features__description">
							<strong class="plans__features plan-features__targeted-description-heading">
								Best for Freelancers:
							</strong>
							Build a unique website with advanced design tools, CSS editing, lots of space for
							audio and video, and the ability to monetize your site with ads.
						</p>

						<div class="plan-features__actions">
							<Button className="plan-features__actions-button">Manage Plan</Button>
						</div>
					</Card>

					<Card className="plans-prototype__plan">
						<PlanFeaturesHeader
							availableForPurchase={ true }
							current={ false }
							currencyCode="USD"
							isJetpack={ false }
							popular={ true }
							newPlan={ false }
							bestValue={ false }
							title="Business"
							planType="business_bundle"
							rawPrice={ 25 }
							discountPrice={ null }
							billingTimeFrame="per month, billed annually"
							hideMonthly={ false }
							isPlaceholder={ false }
							basePlansPath={ null }
							relatedMonthlyPlan={ null }
							isInSignup={ false }
							selectedPlan={ null }
						/>

						<p class="plan-features__description">
							<strong class="plans__features plan-features__targeted-description-heading">
								Best for Small Businesses:
							</strong>
							Power your business website with custom plugins and themes, unlimited premium and
							business theme templates, Google Analytics support, 200 GB storage, and the ability to
							remove WordPress.com branding.
						</p>
						<div class="plan-features__actions">
							<Button primary className="plan-features__actions-button">
								Upgrade
							</Button>
						</div>
					</Card>

					<Card className="plans-prototype__plan">
						<PlanFeaturesHeader
							availableForPurchase={ true }
							current={ false }
							currencyCode="USD"
							isJetpack={ false }
							popular={ false }
							newPlan={ false }
							bestValue={ false }
							title="eCommerce"
							planType="ecommerce-bundle"
							rawPrice={ 45 }
							discountPrice={ null }
							billingTimeFrame="per month, billed annually"
							hideMonthly={ false }
							isPlaceholder={ false }
							basePlansPath={ null }
							relatedMonthlyPlan={ null }
							isInSignup={ false }
							selectedPlan={ null }
						/>

						<p class="plan-features__description">
							<strong class="plans__features plan-features__targeted-description-heading">
								Best for Online Stores:
							</strong>
							Sell products or services with this powerful, all-in-one online store experience. This
							plan includes premium integrations and is extendable, so it’ll grow with you as your
							business grows.
						</p>
						<div class="plan-features__actions">
							<Button className="plan-features__actions-button">Upgrade</Button>
						</div>
					</Card>
				</div>
			</Main>
		);
	}
}

export default DesignAssets;
