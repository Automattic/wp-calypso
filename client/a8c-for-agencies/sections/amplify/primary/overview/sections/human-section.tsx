import { __ } from '@wordpress/i18n';
import PageSectionColumns from 'calypso/a8c-for-agencies/components/page-section-columns';
import AmplifyCriteriaSection from './criteria-section';
import type { Criterion, CriteriaStat } from './criteria-section';

const STATS: CriteriaStat[] = [
	{ num: '50ms', label: __( 'Time it takes to form a first impression' ) },
	{ num: '75%', label: __( 'Of consumers judge credibility by design alone' ) },
	{ num: '34%', label: __( 'Average conversion lift from testimonials on sales pages' ) },
];

const CRITERIA: Criterion[] = [
	{
		id: 'trust-signals',
		num: '01',
		title: __( 'Trust Signals' ),
		summary: __(
			'Does the site give a prospective client enough evidence to feel safe handing over a project?'
		),
	},
	{
		id: 'contact-conversion',
		num: '02',
		title: __( 'Contact & Conversion' ),
		summary: __(
			'A prospective client is ready to reach out. Does the site make that easy, or create friction at the worst possible moment?'
		),
	},
	{
		id: 'seo',
		num: '03',
		title: __( 'SEO' ),
		summary: __(
			'Can a prospective client find this site when they search? All signals are sourced from Google Search Central documentation.'
		),
	},
	{
		id: 'mobile-experience',
		num: '04',
		title: __( 'Mobile Experience' ),
		summary: __(
			'A first impression increasingly happens on a phone. Does the site hold up when a prospective client pulls it up on their device?'
		),
	},
	{
		id: 'content-quality',
		num: '05',
		title: __( 'Content Quality' ),
		summary: __(
			'Is the writing compelling, clear, and professional? Errors and poor readability erode trust before a client has read a single sentence.'
		),
	},
	{
		id: 'design-experience',
		num: '06',
		title: __( 'Design & Experience' ),
		summary: __(
			'Does the site look credible and feel effortless to use? All signals are grounded in the Laws of UX.'
		),
	},
	{
		id: 'accessibility',
		num: '07',
		title: __( 'Accessibility' ),
		summary: __(
			'Does the site work for everyone? Amplify measures against WCAG AA, the standard referenced by courts and regulators globally.'
		),
	},
	{
		id: 'audience-resonance',
		num: '08',
		title: __( 'Audience Resonance' ),
		summary: __(
			'Does the site feel made for the right client? Within seconds of landing, a prospective client should feel the site is speaking directly to them.'
		),
	},
];

export default function AmplifyHumanSection() {
	return (
		<PageSectionColumns>
			<PageSectionColumns.Column fullWidth>
				<AmplifyCriteriaSection
					eyebrow={ __( 'Human-centric analysis' ) }
					title={ __( 'See what prospective customers see' ) }
					intro={ __(
						'When someone lands on your client’s site, they form an impression in under a second. They scan for trust. They look for contact information. They decide, in 3 to 5 seconds, whether this business is worth their time. Amplify measures all of it across eight criteria, then tells you exactly what to fix and why. This is the analysis that separates agencies who deliver beautiful sites from agencies who deliver sites that actually win business.'
					) }
					stats={ STATS }
					criteria={ CRITERIA }
				/>
			</PageSectionColumns.Column>
		</PageSectionColumns>
	);
}
