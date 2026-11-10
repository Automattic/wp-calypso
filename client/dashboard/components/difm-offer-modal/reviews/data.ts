import { __ } from '@wordpress/i18n';

export interface DifmOfferReview {
	id: string;
	/** Out of 5. */
	rating: number;
	title: string;
	quote: string;
	reviewer: string;
	/** The review on Trustpilot. A card without a URL shows "Trustpilot" as plain text. */
	url?: string;
}

export const DIFM_OFFER_REVIEW_MAX_RATING = 5;

/**
 * The reviews translate at call time, so call this in render and not at module load.
 */
export function getDifmOfferReviews(): DifmOfferReview[] {
	return [
		{
			id: 'michelle-hennesay',
			rating: 5,
			/* translators: The title of a customer review of the site building service, from Trustpilot. */
			title: __( 'Amazing service' ),
			/* translators: A customer review of the site building service, from Trustpilot. */
			quote: __(
				'The designers listened to what I was looking for in a site and then took that and created a beautiful professional website in lightning fast speed! Thank you so much!'
			),
			reviewer: 'Michelle Hennesay',
			url: 'https://www.trustpilot.com/reviews/69fddff112c8c3941b0edfb4',
		},
		{
			id: 'jennifer-board',
			rating: 5,
			/* translators: The title of a customer review of the site building service, from Trustpilot. */
			title: __( 'My site is beautiful!' ),
			/* translators: A customer review of the site building service, from Trustpilot. */
			quote: __(
				"My site is beautiful! It's better than I could've hoped for. I was having such a hard time designing the site myself. I had a vision in mind for exactly what I wanted, and they made it happen! Thank you!"
			),
			reviewer: 'Jennifer Board',
			url: 'https://www.trustpilot.com/reviews/6a299679657786a2ef3a9cd3',
		},
		{
			id: 'steve-sonn',
			rating: 5,
			/* translators: The title of a customer review of the site building service, from Trustpilot. */
			title: __( 'Smooth Design Experience' ),
			/* translators: A customer review of the site building service, from Trustpilot. */
			quote: __(
				"The Express Website Design Team did a great job designing a professional website I can take pride in. They used the content I provided and integrated it with the design seamlessly. What's more, the site was completed within a week of handing off the copy and artwork to them. Very impressive!"
			),
			reviewer: 'Steve Sonn',
			url: 'https://www.trustpilot.com/reviews/6a31a275989f28ce4d1e55b1',
		},
		{
			id: 'pablo',
			rating: 5,
			/* translators: The title of a customer review of the site building service, from Trustpilot. */
			title: __( 'Turned around the construction of an impressive website' ),
			/* translators: A customer review of the site building service, from Trustpilot. "Angelo A" is the name of the designer. */
			quote: __(
				"Turned around the construction of an impressive website for my wife's new online ceramics business in a few days. Highly recommended, especially as it was free with an upgrade. Shows you really need an expert to do the job at the end of the day. Thank you Angelo A"
			),
			reviewer: 'Pablo',
			url: 'https://www.trustpilot.com/reviews/69a4aa90075bf3d9b4fd87b0',
		},
	];
}
