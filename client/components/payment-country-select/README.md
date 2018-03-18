PaymentCountrySelect
====================

`PaymentCountrySelect` is a React component that displays a form for selecting a country used in a payment or billing address.

It is a wrapper around the more generic `CountrySelect` component, with the primary difference being that the user's selection is propagated as the default country to all other `PaymentCountrySelect` components on the site. The assumption is that a user who selects a particular country for one payment method (such as a new credit card) is likely to want to select the same country for any other payment methods used later (such as another credit card, or PayPal).

## Properties

This component accepts all the standard properties of the `CountrySelect` component, with the exception of `value` (since the default value of the country selector is controlled internally, as described in the previous section).

In addition, there is one new property, which is optional:

### `onCountrySelected`

A function that is invoked when a country is selected in the component. The function is passed the field name and field value (i.e., the country code) as parameters. This function can be used by code which needs to react to all instances in which a country is selected (or unselected) in the component, regardless of whether the selection happened via user interaction with the country dropdown or due to the country being the default selected option when the component was rendered. (Note that if your code only needs to track changes due to user interaction, the standard `onChange` property supported by the `CountrySelect` component can be used with this component too.)
