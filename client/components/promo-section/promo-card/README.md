# Promo Card

A [`Card` component](../../components/card) based on [`ActionPanel'](../../components/action-panel) designed to promote plan features and partnerships.

## Usage

```jsx
import referralImage from 'calypso/assets/images/earn/referral.svg';
import PromoCard from 'calypso/my-sites/promo-section/promo-card';

const PromoCardExample = () => {
	const img = {
		path: referralImage,
		alt: 'Using Props',
	};
	const clicked = () => alert( 'Clicked!' );
	return (
		<PromoCard title="Under-used Feature" image={ img } isPrimary={ false }>
			<p>
				This is a description of the action. It gives a bit more detail and explains what we are
				inviting the user to do.
			</p>
			<PromoCardCTA
				cta={ {
					text: translate( 'Upgrade to Pro Plan' ),
					action: {
						url: `/checkout/${ siteSlug }/pro`,
						onClick: onUpgradeClick,
						selfTarget: true,
					},
				} }
			/>
		</PromoCard>
	);
};
```
