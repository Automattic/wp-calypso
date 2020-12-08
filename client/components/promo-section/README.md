# Promo Section

A compontent to layout [`PromoCard` components](../../components/promo-section/promo-card) to create a page layout used in the Earn section and Marketing Tools.

## Usage

```jsx
import PromoCard from 'calypso/my-sites/promo-section/promo-card';

const PromoCardExample = () => {
	return (
		<PromoCard title="Under-used Feature">
			<img
				src="/calypso/images/wordpress/logo-stars.svg"
				width="170"
				height="143"
				alt="WordPress logo"
			/>
			<p>
				This is a description of the action. It gives a bit more detail and explains what we are
				inviting the user to do.
			</p>
		</PromoCard>
	);
};
```
