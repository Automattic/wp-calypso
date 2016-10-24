PaymentLogo
====

## Usage

```js
import PaymentLogo from 'components/payment-logo';

<PaymentLogo type="amex" />

<PaymentLogo type="paypal" />

<PaymentLogo type="paypal" isCompact />

```

## Required props

* `type` – String that determines which type of logo is displayed. Currently accepts:
   * amex
   * discover
   * mastercard
   * visa
   * paypal
* `isCompact` (optional) – Boolean that determines if the compact PayPal logo is rendered.
