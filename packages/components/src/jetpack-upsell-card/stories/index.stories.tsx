import JetpackUpsellSection from '..';

export default { title: 'Jetpack Upsell Section' };

const Variations = ( props: any ) => <JetpackUpsellSection purchasedProducts={ [] } { ...props } />;

export const Default = () => (
	<div className="jetpack-upsell-section-story" style={ { margin: 'auto', maxWidth: '1000px' } }>
		<Variations />
		<Variations siteSlug="YourGroovyDomain.com" />
	</div>
);
