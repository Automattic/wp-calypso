# PaymentLogo

## Usage

```js
import PaymentLogo from 'calypso/components/payment-logo';

<>
	<p>Empty Placeholder</p>

	<PaymentLogo type="placeholder" />

	<p>Supported Vendors</p>

	<PaymentLogo type="alipay" />

	<PaymentLogo type="amex" />

	<PaymentLogo type="apple-pay" />

	<PaymentLogo type="bancontact" />

	<PaymentLogo type="diners" />

	<PaymentLogo type="discover" />

	<PaymentLogo type="eps" />

	<PaymentLogo type="giropay" />

	<PaymentLogo type="ideal" />

	<PaymentLogo type="jcb" />

	<PaymentLogo type="mastercard" />

	<PaymentLogo type="p24" />

	<PaymentLogo type="paypal" />
	<PaymentLogo type="paypal" isCompact />

	<PaymentLogo type="unionpay" />

	<PaymentLogo type="visa" />
</>;
```

## Required props

- `type` – String that determines which type of logo is displayed. Currently accepts:
  - `alipay`
  - `amex`
  - `apple-pay`
  - `bancontact`
  - `diners`
  - `discover`
  - `eps`
  - `giropay`
  - `ideal`
  - `jcb`
  - `mastercard`
  - `p24`
  - `paypal`
  - `placeholder`
  - `unionpay`
  - `visa`
- `isCompact` (optional) – Boolean that determines if the compact PayPal logo is rendered.
