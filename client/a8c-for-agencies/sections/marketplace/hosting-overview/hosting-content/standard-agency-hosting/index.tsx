import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import { useContext } from 'react';
import { BackgroundType10 } from 'calypso/a8c-for-agencies/components/page-section/backgrounds';
import { TermPricingContext } from 'calypso/a8c-for-agencies/sections/marketplace/context';
import ProfileAvatar1 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-1.webp';
import ProfileAvatar2 from 'calypso/assets/images/a8c-for-agencies/hosting/standard-testimonial-2.webp';
import HostingTestimonialsSection from '../../../common/hosting-testimonials-section';
import ClientRelationships from '../common/client-relationships';
import HostingFeatures from '../common/hosting-features';
import WPCOMPlanSection from './wpcom-plan-section';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	onAddToCart: ( plan: APIProductFamilyProduct, quantity: number ) => void;
};

export default function StandardAgencyHosting( { onAddToCart }: Props ) {
	const translate = useTranslate();

	const { termPricing } = useContext( TermPricingContext );
	const isTermPricingEnabled = isEnabled( 'a4a-bd-term-pricing' ) && isEnabled( 'a4a-bd-checkout' );

	// Unlike the legacy system, BD monthly plans do not include a free domain, so hide that benefit.
	const showFreeDomain = ! ( isTermPricingEnabled && termPricing === 'monthly' );

	return (
		<div className="standard-agency-hosting">
			<WPCOMPlanSection onSelect={ onAddToCart } />

			<HostingFeatures
				heading={ translate( 'Included with every WordPress.com site' ) }
				showFreeDomain={ showFreeDomain }
			/>

			<HostingTestimonialsSection
				heading={ translate( 'Love for WordPress.com hosting' ) }
				subheading={ translate( 'What agencies say' ) }
				items={ [
					{
						profile: {
							name: 'Ajit Bohra',
							avatar: ProfileAvatar1,
							title: translate( 'Founder, %(companyName)s', {
								args: {
									companyName: 'LUBUS',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'lubus.in',
						},
						testimonial: translate(
							'We aimed to provide clients with a reliable hosting service we could endorse without hesitation, ultimately resulting in satisfied clients. We found that service with WordPress.com.'
						),
					},
					{
						profile: {
							name: 'Brian Lalli',
							avatar: ProfileAvatar2,
							title: translate( 'President, %(companyName)s', {
								args: {
									companyName: 'Moon Rooster LLC',
								},
								comment: '%(companyName)s is the name of the company the testimonial is about.',
							} ),
							site: 'moonrooster.com',
						},
						testimonial: translate(
							"WordPress.com has been crucial to my agency's growth. Its intuitive UI allows me to quickly create sleek, functional websites for my clients, and their reliable hosting and support enable me to rest easy, knowing my sites are in good hands."
						),
					},
				] }
			/>

			<ClientRelationships background={ BackgroundType10 } />
		</div>
	);
}
