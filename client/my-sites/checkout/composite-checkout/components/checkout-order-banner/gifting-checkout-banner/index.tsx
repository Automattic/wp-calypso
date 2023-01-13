import './style.scss';

export function GiftingCheckoutBanner( { siteSlug }: { siteSlug: string } ) {
	return (
		<div className="gifting-checkout-banner">
			<div>
				<h2>Spread the love! 23</h2>
				<p>
					With this gift, you are helping { siteSlug } the content that you and many others
					appreciate and enjoy.
				</p>
			</div>
		</div>
	);
}
