/**
 * @jest-environment jsdom
 */
import {
	computeSubmissionIssues,
	type PodcastCoverImage,
	type PodcastFieldValues,
} from '../use-submission-issues';

// Stand-in for i18n-calypso's translate. The helper only ever uses translate
// as `translate( 'string' ) as string`, so passing the input through is
// faithful enough for the assertions below.
const translate = ( ( s: string ) => s ) as unknown as Parameters<
	typeof computeSubmissionIssues
>[ 3 ];

const validSquareCover: PodcastCoverImage = {
	width: 1500,
	height: 1500,
	mime_type: 'image/jpeg',
};

const completeFields: PodcastFieldValues = {
	podcasting_category_id: '42',
	podcasting_title: 'My Show',
	podcasting_summary: 'A show about things.',
	podcasting_talent_name: 'Jane Doe',
	podcasting_email: 'jane@example.com',
	podcasting_category_1: 'Technology',
	podcasting_image_id: '99',
};

describe( 'computeSubmissionIssues', () => {
	test( 'returns no issues when every field and a published episode are present', () => {
		expect( computeSubmissionIssues( completeFields, validSquareCover, true, translate ) ).toEqual(
			[]
		);
	} );

	test( 'flags missing podcast category, then suppresses the episode check', () => {
		const issues = computeSubmissionIssues(
			{ ...completeFields, podcasting_category_id: '0' },
			validSquareCover,
			false,
			translate
		);
		expect( issues ).toContain( 'Select a podcast category.' );
		// Episode gate only fires when podcasting is actually enabled — otherwise
		// it'd be redundant noise next to the category prompt.
		expect( issues ).not.toContain( 'Publish at least one episode.' );
	} );

	test( 'flags an empty episode list once the query has resolved', () => {
		expect(
			computeSubmissionIssues( completeFields, validSquareCover, false, translate )
		).toContain( 'Publish at least one episode.' );
	} );

	test( 'leaves the episode gate out while the episode query is loading', () => {
		expect(
			computeSubmissionIssues( completeFields, validSquareCover, undefined, translate )
		).not.toContain( 'Publish at least one episode.' );
	} );

	test( 'flags each missing text field independently', () => {
		const issues = computeSubmissionIssues(
			{
				...completeFields,
				podcasting_title: '',
				podcasting_summary: '   ',
				podcasting_talent_name: '',
				podcasting_email: '',
				podcasting_category_1: '0',
			},
			validSquareCover,
			true,
			translate
		);
		expect( issues ).toEqual(
			expect.arrayContaining( [
				'Add a title.',
				'Add a summary.',
				'Add a host, artist, or producer name.',
				'Add an email address.',
				'Choose a primary podcast topic.',
			] )
		);
	} );

	test( 'flags missing cover image when no media id is set', () => {
		expect(
			computeSubmissionIssues(
				{ ...completeFields, podcasting_image_id: '0' },
				null,
				true,
				translate
			)
		).toContain( 'Add a cover image.' );
	} );

	test( 'flags non-PNG/JPG cover image', () => {
		expect(
			computeSubmissionIssues(
				completeFields,
				{ width: 1500, height: 1500, mime_type: 'image/gif' },
				true,
				translate
			)
		).toContain( 'Cover image must be a PNG or JPG.' );
	} );

	test( 'flags non-square cover image', () => {
		expect(
			computeSubmissionIssues(
				completeFields,
				{ width: 1500, height: 1000, mime_type: 'image/jpeg' },
				true,
				translate
			)
		).toContain( 'Cover image must be square.' );
	} );

	test( 'flags cover image outside 1400×1400 – 3000×3000', () => {
		const tooSmall = computeSubmissionIssues(
			completeFields,
			{ width: 800, height: 800, mime_type: 'image/jpeg' },
			true,
			translate
		);
		const tooBig = computeSubmissionIssues(
			completeFields,
			{ width: 4000, height: 4000, mime_type: 'image/jpeg' },
			true,
			translate
		);
		expect( tooSmall ).toContain( 'Cover image must be between 1400×1400 and 3000×3000 pixels.' );
		expect( tooBig ).toContain( 'Cover image must be between 1400×1400 and 3000×3000 pixels.' );
	} );

	test( 'skips dimension/format checks while cover image meta is still loading', () => {
		// `null` means the media item hasn't hydrated yet — we have an id but no
		// dimensions to validate. The helper should not emit format/size issues.
		const issues = computeSubmissionIssues( completeFields, null, true, translate );
		expect( issues ).not.toContain( 'Cover image must be a PNG or JPG.' );
		expect( issues ).not.toContain( 'Cover image must be square.' );
		expect( issues ).not.toContain( 'Cover image must be between 1400×1400 and 3000×3000 pixels.' );
	} );
} );
