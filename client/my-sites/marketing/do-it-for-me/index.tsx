import { Button, CompactCard } from '@automattic/components';
import { useShoppingCart } from '@automattic/shopping-cart';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { fillInSingleCartItemAttributes } from 'calypso/lib/cart-values';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';

function DoItForMePage() {
	const translate = useTranslate();
	const [ isAddingToBasket, setIsAddingToBasket ] = useState( false );
	const { replaceProductsInCart } = useShoppingCart();
	const products = useSelector( getProductsList );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );

	const onAddDIFMProductToCart = async () => {
		setIsAddingToBasket( true );
		const difmProduct = fillInSingleCartItemAttributes(
			{ product_slug: 'wp_difm_lite' },
			products
		);
		await replaceProductsInCart( [ difmProduct ] );
		page( `/checkout/${ selectedSiteSlug }` );
	};
	return (
		<CompactCard>
			<section>
				<div>
					<div>
						<div>
							<h1>Your site. Built by us. Built for you.</h1>
						</div>
						<div>
							<p>
								You want the website of your dreams.
								<br />
								Our experts can create it for you.
							</p>
							<span></span>
							<span></span>
						</div>
						<div>
							<div>
								<div>
									<img
										src="https://wpcom.files.wordpress.com/2020/10/built-by-hero-image.png"
										alt="Website screenshots"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div>
					<div>
						<div>
							<h1>
								<em>You’ve got an idea. We can bring it to life.</em>
							</h1>
							<p>Our website building plans are perfect for:</p>
							<span></span>
							<div>
								<div>
									<div>
										<div></div>
									</div>
									<h2>Online Stores</h2>
									<p>
										Turn your website into an online store with everything you need to sell your
										products, ideas, or services. Easily accept one-time or recurring payments,
										reach your customers, and design your site so it stands apart — and converts
										more.
									</p>
								</div>
								<div>
									<div>
										<div></div>
									</div>
									<h2>Educational Websites</h2>
									<p>
										Whether you’re creating webinars, podcasts, online courses, or more, we can help
										you create a single platform that helps you connect with your audience, build a
										following, and earn an income from your content.
									</p>
								</div>
								<div>
									<div>
										<div></div>
									</div>
									<h2>Professional Services</h2>
									<p>
										Launch and grow your business with a professional design that helps you stand
										out, marketing tools to help you reach your customers, and the functionality you
										need to keep growing.
									</p>
								</div>
							</div>
							<span></span>
							<div>
								<hr />
							</div>
							<span></span>
							<p>
								<em>Select the type of website you’d like to build, and we’ll get you started.</em>
							</p>
						</div>
					</div>
				</div>
			</section>

			<p>
				<Button busy={ isAddingToBasket } primary onClick={ onAddDIFMProductToCart }>
					{ translate( 'Purchase Do It For Me' ) }
				</Button>
			</p>
		</CompactCard>
	);
}

export default function WrappedDoItForMePage(): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<DoItForMePage />
		</CalypsoShoppingCartProvider>
	);
}
