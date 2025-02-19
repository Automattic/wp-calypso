import { useMemo } from '@wordpress/element';
import { useTranslate } from 'i18n-calypso';
import { HostingCard, HostingCardGrid } from 'calypso/components/hosting-card';

const Cards = () => {
	const translate = useTranslate();
	const cards = useMemo(
		() => [
			{
				title: translate( 'Seriously secure' ),
				text: translate(
					"Firewalls, encryption, brute force, and DDoS protection. Your security's all taken care of so you can stay one step ahead of any threats."
				),
			},
			{
				title: translate( 'Unmetered bandwidth' ),
				text: translate(
					"With 99.999% uptime and entirely unmetered bandwidth and traffic on every plan, you'll never need to worry about being too successful."
				),
			},
			{
				title: translate( 'Power, meet performance' ),
				text: translate(
					'Our custom 28+ location CDN and 99.999% uptime ensure your site is always fast and always available from anywhere in the world.'
				),
			},
			{
				title: translate( 'Plugins, themes, and custom code' ),
				text: translate(
					'Build anything with full support and automatic updates for 50,000+ plugins and themes. Or start from scratch with your own custom code.'
				),
			},
			{
				title: translate( 'Expert support' ),
				text: translate(
					"Whenever you're stuck, whatever you're trying to make happen – our Happiness Engineers have the answers."
				),
			},
		],
		[ translate ]
	);

	return (
		<HostingCardGrid>
			{ cards.map( ( { title, text } ) => (
				<HostingCard inGrid key={ title } title={ title }>
					<p>{ text }</p>
				</HostingCard>
			) ) }
		</HostingCardGrid>
	);
};

export default Cards;
