/**
 * PROTOTYPE — proof of concept only.
 *
 * `/custom-signup` is a split-screen signup styled after the
 * automattic.com/for-agencies visual language. It's viewable while logged in
 * so it can be demoed, and it never creates an agency.
 *
 * It ships a single light design (no dark mode) and owns all of its layout
 * styles, so it doesn't import signup-v2's stylesheets or their dark-mode rules.
 *
 * This entire signup form is intended to replace the logged-out `/signup`
 * flow in the future.
 */
import SignupTestimonial from './components/signup-testimonial';
import CustomSignupForm from './custom-signup-form';
import ForAgenciesLogo from './for-agencies-logo';
import SignupPitch from './signup-pitch';

import './style.scss';

export default function CustomSignup() {
	return (
		<div className="a4a-custom-signup">
			<div className="a4a-custom-signup-layout">
				<aside className="a4a-custom-signup-sidebar">
					<ForAgenciesLogo />
					<SignupPitch />
					<SignupTestimonial />
				</aside>
				<main className="a4a-custom-signup-main">
					<CustomSignupForm />
				</main>
			</div>
		</div>
	);
}
