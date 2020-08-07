/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Internal dependencies
 */
// import JetpackBundleCard from 'components/jetpack/card/jetpack-bundle-card';
// import JetpackIndividualProductCard from 'components/jetpack/card/jetpack-individual-product-card';
// import JetpackPlanCard from 'components/jetpack/card/jetpack-plan-card';

// TODO: complet
type Props = {
	// property (plan, bundle, or product)
	// isFeatured (Jetpack Security in v1)
	// isUpsold
	// onClick
	// onCancel
};

const ProductCard: FunctionComponent< Props > = () => {
	const props = {};

	let component;

	/*
    if property is plan
        component = JetpackPlanCard
    else if property is bundle
        component = JetpackBundleCard
    else if property is product
        component = JetpackIndividualProductCard
    */

	/*
    props.iconSlug = property.product_slug + '_v2' 
    props.productName = property.product_name
    props.subheadline = property.tagline
    props.description = property.description
    props.currencyCode = property.currency_code
    props.originalPrice = property.prices[ property.currency_code ]
    props.discountedPrice = ?
    props.billingTimeFrame = property.bill_period_label (+ ', billed yearly')
    props.features = ?
    props.onButtonClick = onClick
    */

	/*
    if property has options (Daily or Real-Time)
        props.withStartingPrice = true

        unless customer owns option or customer owns option of another product in the bundle
            props.description += 'Available options: Real-Time or Daily'
    */

	/*
    if property option (Daily or Real-Time)
        props.productType = 'Daily' or 'Real-Time'
    */

	/*
    if isFeatured
        if is Jetpack Security Real-Time and customer owns Real-Time Scan & Backup
            props.badgeLabel = 'Most popular'
        else
            props.badgeLabel = 'Best value'

        props.isHighlighted = true
        props.isExpanded = true (desktop only)
    */

	/*
    if customer owns property
        props.isOwned = true

        if property is plan (or bundle?)
            props.buttonLabel = 'Manage Plan'
            props.badgeLabel = 'Your plan'

            if plan is deprecated
                props.isDeprecated = true
                props.expirationDate = ?
        else
            props.buttonLabel = 'Manage Subscription'

            if property is in plan (or bundle?)
                props.badgeLabel = 'Included in your plan'
            else
                props.badgeLabel = 'You own this'

            if property is in bundle owned by customer (show in Scan only?)
                props.discountMessage = 'You are currently saving {amount} a month because you own {products}'
    else
        props.buttonLabel = 'Get {property full name}'

        if customer owns other product in existing bundle
            props.discountMessage = 'Save {amount} a year on {product} because you own {other product}!' 
    */

	/*
    if customer owns Daily bundle
        props.upsell = <RealTimeUpsellComponent/>
    */

	/*
    if isUpsold
        props.buttonLabel = 'Yes, add {property full name}'
        props.cancelLabel = 'No, I do not want to add {property name}'
        props.onCancelClick = onCancel
    */

	return React.createElement( component, props );
};

export default ProductCard;
