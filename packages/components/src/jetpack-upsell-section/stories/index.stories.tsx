import JetpackUpsellSection from '../';

export default { title: 'Jetpack Upsell Section' };

const Variations = ( props: object ) => (
	<JetpackUpsellSection purchasedProducts={ [] } siteUrl="YourGroovyDomain.com" { ...props } />
);

export const Default = () => (
	<div className="jetpack-upsell-section-story" style={ { margin: 'auto', maxWidth: '1000px' } }>
		<Variations />
	</div>
);
