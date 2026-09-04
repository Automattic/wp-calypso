/**
 * @jest-environment jsdom
 */
import { getCourseLessonUrl } from '../course-lessons';

describe( 'getCourseLessonUrl', () => {
	it( 'returns the matching lesson for a mapped task', () => {
		expect( getCourseLessonUrl( 'design_completed', 'free' ) ).toBe(
			'https://wordpress.com/support/courses/create-your-website/choose-a-theme/'
		);
	} );

	it( 'returns null for an unmapped task', () => {
		expect( getCourseLessonUrl( 'verify_email', 'free' ) ).toBeNull();
	} );

	it( 'uses the blog course for blog-intent checklists', () => {
		expect( getCourseLessonUrl( 'design_completed', 'write' ) ).toBe(
			'https://wordpress.com/support/courses/create-your-blog/blog-theme/'
		);
		expect( getCourseLessonUrl( 'site_launched', 'intent-write' ) ).toBe(
			'https://wordpress.com/support/courses/create-your-blog/launch-and-grow-your-blog/'
		);
	} );

	it( 'falls back to the default lesson for blog-intent checklists without an override', () => {
		expect( getCourseLessonUrl( 'first_post_published', 'write' ) ).toBe(
			'https://wordpress.com/support/courses/create-your-blog/create-blog-posts/'
		);
	} );

	it( 'handles a missing checklist slug', () => {
		expect( getCourseLessonUrl( 'site_launched', null ) ).toBe(
			'https://wordpress.com/support/courses/create-your-website/launch-your-site/'
		);
	} );
} );
