import Offering from 'calypso/a8c-for-agencies/components/offering';
import JetpackLogo from 'calypso/components/jetpack-logo';

const OverviewBodyProducts = () => {
	//TODO: replace with proper products
	return (
		<Offering
			title="Products"
			description="Add services to secure, improve performance, and sell goods on your clients’ sites."
			items={ [
				{
					title: 'Jetpack',
					titleIcon: <JetpackLogo size={ 26 } />,
					description:
						'Jetpack offers a flexible suite of security, performance, and growth tools. Pick and choose exactly what you need, à la carte, or explore product bundles for world-class savings.',
					highlights: [
						'Optimize your site speed in a few clicks.',
						'Back up your site in real-time as you edit.',
						'Create better content with AI.',
						'Automatically block comment & form spam.',
						'Stay safe with malware firewall & one-click fixes.',
						'Get advanced site stats and traffic insights.',
					],
					buttonTitle: 'View all Jetpack products',
					actionHandler: () => {},
				},
			] }
		/>
	);
};

export default OverviewBodyProducts;
