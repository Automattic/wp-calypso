import { __ } from '@wordpress/i18n';

/**
 * Sample report for a fictional restaurant, used on the landing page and in
 * the sample viewer. Not a real business: keep it obviously made up.
 * Category maxes follow the current weighted rubric (A4A-3398 may change them).
 */

export type SampleSeverity = 'critical' | 'high' | 'medium' | 'low';
export type SampleSignalStatus = 'pass' | 'partial' | 'miss';
export type SampleLensKey = 'human' | 'ai';

export type SampleCategory = {
	key: string;
	label: string;
	score: number;
	max: number;
	why: string;
	signals: { label: string; status: SampleSignalStatus; note: string }[];
};

export type SampleLens = {
	key: SampleLensKey;
	label: string;
	title: string;
	score: number;
	categories: SampleCategory[];
};

export type SampleFinding = {
	severity: SampleSeverity;
	lens: SampleLensKey;
	category: string;
	title: string;
	detail: string;
	impact: string;
	improve: string;
};

export function getSampleSite() {
	return {
		name: __( 'Olive & Ember' ),
		descriptor: __( 'Neighborhood trattoria' ),
		url: 'oliveandember.example',
		/* translators: date the sample report was generated */
		date: __( 'September 14, 2026' ),
	};
}

export function getSampleLenses(): SampleLens[] {
	return [
		{
			key: 'human',
			label: __( 'People' ),
			title: __( 'How visitors judge a site' ),
			score: 59,
			categories: [
				{
					key: 'trust',
					label: __( 'Trust Signals' ),
					score: 9,
					max: 18,
					why: __( 'Diners choosing somewhere new look for proof that other people loved it.' ),
					signals: [
						{
							label: __( 'Reviews' ),
							status: 'miss',
							note: __( 'No reviews or ratings appear on the homepage.' ),
						},
						{
							label: __( 'Press mentions' ),
							status: 'miss',
							note: __( 'No press or awards are shown.' ),
						},
						{
							label: __( 'Real photos' ),
							status: 'pass',
							note: __( 'Original photos of the dining room and dishes.' ),
						},
					],
				},
				{
					key: 'contact',
					label: __( 'Contact & Conversion' ),
					score: 8,
					max: 17,
					why: __(
						'Most visitors are deciding where to eat soon. Booking has to be one tap away.'
					),
					signals: [
						{
							label: __( 'Reservation button' ),
							status: 'miss',
							note: __( 'No booking link above the fold.' ),
						},
						{
							label: __( 'Phone number' ),
							status: 'partial',
							note: __( 'Only in the footer, and not tappable on mobile.' ),
						},
						{
							label: __( 'Hours' ),
							status: 'pass',
							note: __( 'Opening hours are listed on the homepage.' ),
						},
					],
				},
				{
					key: 'seo',
					label: __( 'SEO' ),
					score: 7,
					max: 11,
					why: __( 'Search is how most diners find a restaurant they haven’t tried.' ),
					signals: [
						{
							label: __( 'Title tag' ),
							status: 'miss',
							note: __( 'The page title is just “Home.”' ),
						},
						{
							label: __( 'Meta description' ),
							status: 'pass',
							note: __( 'Present and mentions the neighborhood.' ),
						},
					],
				},
				{
					key: 'mobile',
					label: __( 'Mobile Experience' ),
					score: 8,
					max: 12,
					why: __( 'Restaurant searches happen on phones, often on the way out the door.' ),
					signals: [
						{
							label: __( 'Tap targets' ),
							status: 'partial',
							note: __( 'Footer links are too small to tap reliably.' ),
						},
					],
				},
				{
					key: 'content',
					label: __( 'Content Quality' ),
					score: 9,
					max: 12,
					why: __( 'Clear, specific copy helps diners picture the meal before they book.' ),
					signals: [
						{
							label: __( 'Menu preview' ),
							status: 'partial',
							note: __( 'The menu is only available as a PDF download.' ),
						},
					],
				},
				{
					key: 'design',
					label: __( 'Design & Experience' ),
					score: 8,
					max: 10,
					why: __( 'A polished page signals a polished dining room.' ),
					signals: [
						{
							label: __( 'Visual hierarchy' ),
							status: 'pass',
							note: __( 'Strong photography and a calm layout.' ),
						},
					],
				},
				{
					key: 'a11y',
					label: __( 'Accessibility' ),
					score: 6,
					max: 10,
					why: __( 'Everyone should be able to read the menu and book a table.' ),
					signals: [
						{
							label: __( 'Text contrast' ),
							status: 'miss',
							note: __( 'Specials text over photos is hard to read.' ),
						},
					],
				},
				{
					key: 'audience',
					label: __( 'Audience Resonance' ),
					score: 4,
					max: 10,
					why: __( 'Visitors decide in seconds whether this is the kind of place they want.' ),
					signals: [
						{
							label: __( 'Hero headline' ),
							status: 'miss',
							note: __( '“Welcome” doesn’t say what kind of food or where.' ),
						},
					],
				},
			],
		},
		{
			key: 'ai',
			label: __( 'AI agents' ),
			title: __( 'How AI interprets a site' ),
			score: 43,
			categories: [
				{
					key: 'technical',
					label: __( 'Technical Health' ),
					score: 16,
					max: 20,
					why: __( 'AI crawlers need to reach and read the page before they can recommend it.' ),
					signals: [
						{
							label: __( 'Crawler access' ),
							status: 'pass',
							note: __( 'AI crawlers are allowed in robots.txt.' ),
						},
					],
				},
				{
					key: 'schema',
					label: __( 'Structured Data' ),
					score: 3,
					max: 18,
					why: __(
						'Structured data tells AI tools the cuisine, hours, price range, and address for certain.'
					),
					signals: [
						{
							label: __( 'Restaurant schema' ),
							status: 'miss',
							note: __( 'No Restaurant or LocalBusiness markup.' ),
						},
						{
							label: __( 'Menu markup' ),
							status: 'miss',
							note: __( 'Menu items aren’t marked up.' ),
						},
					],
				},
				{
					key: 'aeo',
					label: __( 'AEO Readiness' ),
					score: 4,
					max: 16,
					why: __( 'People ask assistants direct questions. The page should answer them.' ),
					signals: [
						{
							label: __( 'Common questions' ),
							status: 'miss',
							note: __( 'Parking, dietary options, and private dining aren’t covered.' ),
						},
					],
				},
				{
					key: 'eeat',
					label: __( 'E-E-A-T Signals' ),
					score: 7,
					max: 14,
					why: __( 'A named chef and a real story make the business easier to trust and cite.' ),
					signals: [
						{
							label: __( 'About the team' ),
							status: 'partial',
							note: __( 'The chef is pictured but not named.' ),
						},
					],
				},
				{
					key: 'freshness',
					label: __( 'Content Freshness' ),
					score: 4,
					max: 12,
					why: __( 'Assistants favor sources that look current.' ),
					signals: [
						{
							label: __( 'Menu date' ),
							status: 'miss',
							note: __( 'The linked menu PDF was last updated in 2024.' ),
						},
					],
				},
				{
					key: 'entity',
					label: __( 'Entity Clarity' ),
					score: 6,
					max: 10,
					why: __( 'AI tools need to be sure which Olive & Ember this is, and where.' ),
					signals: [
						{
							label: __( 'Address as text' ),
							status: 'partial',
							note: __( 'The address only appears inside a map image.' ),
						},
					],
				},
				{
					key: 'specificity',
					label: __( 'Content Specificity' ),
					score: 3,
					max: 7,
					why: __( 'Specific dishes and details give AI tools something to quote.' ),
					signals: [
						{
							label: __( 'Signature dishes' ),
							status: 'miss',
							note: __( 'No dishes are named on the homepage.' ),
						},
					],
				},
				{
					key: 'llms',
					label: __( 'llms.txt' ),
					score: 0,
					max: 3,
					why: __( 'A short summary file that some AI tools read first.' ),
					signals: [
						{
							label: __( 'llms.txt file' ),
							status: 'miss',
							note: __( 'Not present.' ),
						},
					],
				},
			],
		},
	];
}

export function getSampleFindings(): SampleFinding[] {
	return [
		{
			severity: 'critical',
			lens: 'human',
			category: __( 'Contact & Conversion' ),
			title: __( 'No way to book from the top of the page' ),
			detail: __(
				'Visitors scroll past three photos before they find a phone number, and there’s no reservation link.'
			),
			impact: __( 'Diners deciding where to eat tonight will book somewhere that makes it easy.' ),
			improve: __(
				'Add a “Book a table” button to the header, and make the phone number tappable.'
			),
		},
		{
			severity: 'critical',
			lens: 'ai',
			category: __( 'Structured Data' ),
			title: __( 'AI tools can’t confirm the basics' ),
			detail: __( 'There’s no Restaurant markup for cuisine, hours, price range, or address.' ),
			impact: __(
				'When someone asks an assistant for dinner nearby, the restaurant is less likely to be suggested.'
			),
			improve: __(
				'Add Restaurant markup with cuisine, hours, price range, address, and a link to the menu.'
			),
		},
		{
			severity: 'high',
			lens: 'human',
			category: __( 'Audience Resonance' ),
			title: __( 'The headline just says “Welcome”' ),
			detail: __(
				'Nothing above the fold says it’s an Italian trattoria or which neighborhood it’s in.'
			),
			impact: __( 'First-time visitors have to work out whether it’s what they’re looking for.' ),
			improve: __(
				'Lead with what and where, for example “Wood-fired Italian in the heart of Riverside.”'
			),
		},
		{
			severity: 'high',
			lens: 'human',
			category: __( 'Trust Signals' ),
			title: __( 'No reviews or press on the homepage' ),
			detail: __( 'There are no reviews, ratings, or press mentions anywhere on the page.' ),
			impact: __( 'New diners lean on social proof when choosing somewhere they haven’t been.' ),
			improve: __(
				'Show two or three recent guest reviews and any local press near the top of the page.'
			),
		},
		{
			severity: 'high',
			lens: 'ai',
			category: __( 'AEO Readiness' ),
			title: __( 'Common questions go unanswered' ),
			detail: __( 'Parking, dietary options, and private dining aren’t mentioned anywhere.' ),
			impact: __( 'Assistants answer these questions with sources that do cover them.' ),
			improve: __(
				'Add a short section that answers parking, dietary options, and private dining in plain language.'
			),
		},
		{
			severity: 'high',
			lens: 'ai',
			category: __( 'Content Freshness' ),
			title: __( 'The menu looks out of date' ),
			detail: __( 'The only menu is a PDF last updated in 2024.' ),
			impact: __(
				'Stale content makes the restaurant look closed or neglected to people and AI alike.'
			),
			improve: __(
				'Publish the current menu as a page on the site, and keep seasonal dishes up to date.'
			),
		},
		{
			severity: 'medium',
			lens: 'human',
			category: __( 'Accessibility' ),
			title: __( 'Specials are hard to read' ),
			detail: __( 'White text sits directly on busy food photos.' ),
			impact: __( 'Some visitors will miss the specials entirely.' ),
			improve: __(
				'Move specials onto a solid background, or add a dark overlay behind the text.'
			),
		},
		{
			severity: 'medium',
			lens: 'human',
			category: __( 'SEO' ),
			title: __( 'The page title is “Home”' ),
			detail: __( 'Search results show “Home” instead of the restaurant’s name and cuisine.' ),
			impact: __( 'Fewer people click through from search.' ),
			improve: __( 'Change the title to the restaurant’s name, cuisine, and neighborhood.' ),
		},
		{
			severity: 'medium',
			lens: 'ai',
			category: __( 'Entity Clarity' ),
			title: __( 'The address is only in a map image' ),
			detail: __( 'Neither people nor AI tools can copy or read the address as text.' ),
			impact: __( 'AI tools may not connect the site to the right location.' ),
			improve: __( 'Add the full address as text in the footer and on the contact section.' ),
		},
		{
			severity: 'low',
			lens: 'ai',
			category: __( 'E-E-A-T Signals' ),
			title: __( 'The chef isn’t named' ),
			detail: __( 'The kitchen team is pictured, but there’s no name or story.' ),
			impact: __(
				'A named chef gives diners and AI tools a reason to trust and mention the place.'
			),
			improve: __(
				'Add a short paragraph about the chef, with a name and a sentence about their cooking.'
			),
		},
		{
			severity: 'low',
			lens: 'ai',
			category: __( 'llms.txt' ),
			title: __( 'No llms.txt file' ),
			detail: __( 'There’s no short summary file for AI tools.' ),
			impact: __( 'A small, optional boost for how AI tools describe the restaurant.' ),
			improve: __(
				'Add a brief llms.txt that summarizes the restaurant, menu, hours, and location.'
			),
		},
	];
}

export function getSeverityLabel( severity: SampleSeverity ) {
	switch ( severity ) {
		case 'critical':
			return __( 'Critical' );
		case 'high':
			return __( 'High' );
		case 'medium':
			return __( 'Medium' );
		default:
			return __( 'Low' );
	}
}
