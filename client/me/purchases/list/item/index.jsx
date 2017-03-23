/**
 * External dependencies
 */
import classNames from 'classnames';
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import {
    getName,
    isExpired,
    isExpiring,
    isIncludedWithPlan,
    isOneTimePurchase,
    isRenewing,
    purchaseType,
    showCreditCardExpiringWarning,
} from 'lib/purchases';
import Notice from 'components/notice';
import paths from '../../paths';

const PurchaseItem = React.createClass({
    propTypes: {
        isPlaceholder: React.PropTypes.bool,
        purchase: React.PropTypes.object,
        slug: React.PropTypes.string,
    },

    renewsOrExpiresOn() {
        const { purchase } = this.props;

        if (showCreditCardExpiringWarning(purchase)) {
            return (
                <Notice isCompact status="is-error" icon="spam">
                    {this.translate('Credit card expiring soon')}
                </Notice>
            );
        }

        if (isRenewing(purchase)) {
            return this.translate('Renews on %s', {
                args: purchase.renewMoment.format('LL'),
            });
        }

        if (isExpiring(purchase)) {
            if (purchase.expiryMoment < this.moment().add(30, 'days')) {
                return (
                    <Notice isCompact status="is-error" icon="spam">
                        {this.translate('Expires %(timeUntilExpiry)s', {
                            args: {
                                timeUntilExpiry: purchase.expiryMoment.fromNow(),
                            },
                            context: 'timeUntilExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
                        })}
                    </Notice>
                );
            }

            return this.translate('Expires on %s', {
                args: purchase.expiryMoment.format('LL'),
            });
        }

        if (isExpired(purchase)) {
            return (
                <Notice isCompact status="is-error" icon="spam">
                    {this.translate('Expired %(timeSinceExpiry)s', {
                        args: {
                            timeSinceExpiry: purchase.expiryMoment.fromNow(),
                        },
                        context: 'timeSinceExpiry is of the form "[number] [time-period] ago" i.e. "3 days ago"',
                    })}
                </Notice>
            );
        }

        if (isIncludedWithPlan(purchase)) {
            return this.translate('Included with Plan');
        }

        if (isOneTimePurchase(purchase)) {
            return this.translate('Never Expires');
        }

        return null;
    },

    placeholder() {
        return (
            <span>
                <div className="purchase-item__title" />
                <div className="purchase-item__purchase-type" />
                <div className="purchase-item__purchase-date" />
            </span>
        );
    },

    scrollToTop() {
        window.scrollTo(0, 0);
    },

    render() {
        const { isPlaceholder } = this.props,
            classes = classNames(
                'purchase-item',
                {
                    'is-expired': this.props.purchase &&
                        'expired' === this.props.purchase.expiryStatus,
                },
                { 'is-placeholder': isPlaceholder },
                {
                    'is-included-with-plan': this.props.purchase &&
                        isIncludedWithPlan(this.props.purchase),
                }
            );

        let content, props = {};

        if (isPlaceholder) {
            content = this.placeholder();
        } else {
            content = (
                <span>
                    <div className="purchase-item__title">
                        {getName(this.props.purchase)}
                    </div>
                    <div className="purchase-item__purchase-type">
                        {purchaseType(this.props.purchase)}
                    </div>
                    <div className="purchase-item__purchase-date">
                        {this.renewsOrExpiresOn()}
                    </div>
                </span>
            );
        }

        if (!isPlaceholder) {
            props = {
                href: paths.managePurchase(this.props.slug, this.props.purchase.id),
                onClick: this.scrollToTop,
            };
        }

        return (
            <CompactCard className={classes} {...props}>
                {content}
            </CompactCard>
        );
    },
});

export default PurchaseItem;
