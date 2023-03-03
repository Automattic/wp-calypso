import JetpackUpsellCard from '..';

export default { title: 'Jetpack Upsell Card' };

const upgradeUrls = {
	backup: 'https://jetpack.com',
	boost: 'https://jetpack.com',
	search: 'https://jetpack.com',
	security: 'https://jetpack.com',
	social: 'https://jetpack.com',
	video: 'https://jetpack.com',
};
const UpsellSection = ( props: any ) => (
	<div className="jetpack-upsell-section-story" style={ { margin: 'auto', maxWidth: '1000px' } }>
		<JetpackUpsellCard purchasedProducts={ [] } upgradeUrls={ upgradeUrls } { ...props } />
	</div>
);

export const Default = () => <UpsellSection />;
export const WithACustomSiteSlug = () => <UpsellSection siteSlug="YourCustomDomain.com" />;
export const WithNoUpgradeUrls = () => (
	<>
		<UpsellSection upgradeUrls={ {} } />
		<p>Nothing should be rendered for this story.</p>
	</>
);
