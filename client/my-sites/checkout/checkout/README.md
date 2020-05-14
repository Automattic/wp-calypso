# checkout

This module contains all the non-shared components for the checkout page (`/checkout`).

Checkout is in a transitional state right now with the underlying core generally Flux-based and new additions grafted in using Redux.

Domain contact details data flow (2017-06-07):

1. If it exists, previous purchase contact data is loaded from the API into a `_contactDetailsCache` property in Redux state.
2. That data is loaded into the domain details `formStateController`.
3. `formStateController`'s state is authoritative _while on the main domain details form_ and we watch it for changes which we immediately propagate uni-directionally into Redux. Extra domain detail forms (like ccTLD forms for example) interact directly with Redux and the Redux state is authoritative on those forms at all times.
4. Rendering is done by pulling `formStateController` state values on the main domain details form. Rendering is done by pulling from Redux on extra domain detail forms.
5. The Redux properties are entirely authoritative at the end of the checkout process. We grab everything in there to submit to the server-side.

## Components

### Processor/country - country-specific-payment-fields.jsx

Processing payments in countries such as Brazil via Ebanx require us to collect extra information from the user.

See: `PAYMENT_PROCESSOR_COUNTRIES_FIELDS.BR.fields` in `client/lib/checkout/constants.js`

Most prominent is the tax identification number, for which unique validation exists. See: `client/lib/checkout/processor-specific.js`
