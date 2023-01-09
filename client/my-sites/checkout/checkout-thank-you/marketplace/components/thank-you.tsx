type Product = {
	name: string;
	description: string;
};

type ThankYouProductProps = {
	product: Product;
};

type ThankYouProps = {
	products: Array< Product >;
};

const ThankYouHeader = () => {
	return (
		<div>
			<h1>You're all set James!</h1>
			<h2>
				Congratulations on your purchase. You can now extend the possibilities of your site with
				your WordPress.com plugins.
			</h2>
		</div>
	);
};

const ThankYouProduct = ( { product }: ThankYouProductProps ) => {
	const { name, description } = product;
	return (
		<div>
			<h3>{ name }</h3>
			<p>{ description }</p>
		</div>
	);
};

const ThankYouBody = ( { products }: ThankYouProps ) => {
	return (
		<div>
			{ products.map( ( p ) => (
				<ThankYouProduct key={ p.name } product={ p } />
			) ) }
		</div>
	);
};

const ThankYouFooter = () => {
	return <div>Thank you footer</div>;
};

const ThankYou = ( { products }: ThankYouProps ) => {
	return (
		<div>
			<ThankYouHeader />
			<ThankYouBody products={ products } />
			<ThankYouFooter />
		</div>
	);
};

export default ThankYou;
