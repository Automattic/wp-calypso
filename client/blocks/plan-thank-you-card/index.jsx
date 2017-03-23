/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';
import { getCurrentPlan } from 'state/sites/plans/selectors';
import QuerySites from 'components/data/query-sites';
import QuerySitePlans from 'components/data/query-site-plans';
import { getPlan } from 'lib/plans';
import formatCurrency from 'lib/format-currency';
import ThankYouCard from 'components/thank-you-card';
import PlanIcon from 'components/plans/plan-icon';
import { getPlanClass } from 'lib/plans/constants';

const PlanThankYouCard = (
    {
        plan,
        translate,
        siteId,
        siteUrl,
        action,
    }
) => {
    const name = plan &&
        translate('%(planName)s Plan', {
            args: { planName: getPlan(plan.productSlug).getTitle() },
        });
    const price = plan && formatCurrency(plan.rawPrice, plan.currencyCode);
    const productSlug = plan && plan.productSlug;
    const planClass = productSlug ? getPlanClass(productSlug) : '';
    const planIcon = productSlug ? <PlanIcon plan={productSlug} /> : null;
    const renderAction = () => {
        if (action) {
            return action;
        }

        return null;
    };

    return (
        <div className={classnames('plan-thank-you-card', planClass)}>
            <QuerySites siteId={siteId} />
            <QuerySitePlans siteId={siteId} />

            <ThankYouCard
                name={name}
                price={price}
                heading={translate('Thank you for your purchase!')}
                description={translate(
                    "Now that we've taken care of the plan, it's time to see your new site."
                )}
                buttonUrl={siteUrl}
                buttonText={translate('Visit Your Site')}
                icon={planIcon}
                action={renderAction()}
            />
        </div>
    );
};

PlanThankYouCard.propTypes = {
    plan: PropTypes.object,
    siteId: PropTypes.number.isRequired,
    siteUrl: PropTypes.string,
    translate: PropTypes.func.isRequired,
    action: PropTypes.node,
};

export default connect((state, ownProps) => {
    const site = getRawSite(state, ownProps.siteId);
    const plan = getCurrentPlan(state, ownProps.siteId);

    return {
        plan,
        siteUrl: site && site.URL,
    };
})(localize(PlanThankYouCard));
