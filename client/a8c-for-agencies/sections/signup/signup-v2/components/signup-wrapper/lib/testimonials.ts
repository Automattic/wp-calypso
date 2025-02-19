import { translate } from 'i18n-calypso';
import TestimonialAvatar1 from 'calypso/assets/images/a8c-for-agencies/signup/testimonial-1.jpg';

export const TESTIMONIALS = [
	{
		name: 'Lauren Robinson',
		position: translate( 'Growth Strategist' ),
		quote: translate(
			`"Our streamlined process, facilitated by Automattic for Agencies, enhances both website functionality and our clients' business outcomes."`
		),
		avatar: TestimonialAvatar1,
		company: { name: 'Big Red Jelly' },
	},
];

export const getTestimonial = () => {
	const randomIndex = Math.floor( Math.random() * TESTIMONIALS.length );
	return TESTIMONIALS[ randomIndex ];
};
