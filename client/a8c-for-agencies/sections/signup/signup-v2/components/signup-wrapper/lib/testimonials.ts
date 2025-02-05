import { translate } from 'i18n-calypso';

export const TESTIMONIALS = [
	{
		name: 'Ben Giordano',
		position: translate( 'Founder' ),
		quote: translate(
			"With Pressable's affiliation with Automattic, the same people behind WordPress.com and WordPress VIP, we knew we’d found the right home for our client portfolio."
		),
		user: {
			display_name: 'Ben Giordano',
			name: 'Ben Giordano',
			avatar_URL:
				'https://1.gravatar.com/avatar/dd316be8fcfeeb91a1e5bcc910237196934b8e20992cff41e5b04b8f96abc088?s=96&d=identicon',
		},
		url: { url: 'https://freshysites.com', name: 'freshysites.com ↗' },
	},
];

export const getTestimonial = () => {
	const randomIndex = Math.floor( Math.random() * TESTIMONIALS.length );
	return TESTIMONIALS[ randomIndex ];
};
