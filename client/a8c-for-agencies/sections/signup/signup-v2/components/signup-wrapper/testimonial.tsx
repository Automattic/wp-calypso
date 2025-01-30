import { Gravatar } from '@automattic/components';
import { getTestimonial } from './lib/testimonials';

const SignupTestimonial = () => {
	const testimonial = getTestimonial();
	return (
		<div className="signup-wrapper__testimonial">
			<p className="signup-wrapper__testimonial-text">{ testimonial.quote }</p>

			<div className="signup-wrapper__testimonial-author">
				<Gravatar user={ testimonial.user } size={ 48 } />
				<div className="signup-wrapper__testimonial-info">
					<span className="signup-wrapper__testimonial-name">{ testimonial.name }</span>
					<span className="signup-wrapper__testimonial-title">{ testimonial.position }</span>
					<a
						href={ testimonial.url.url }
						target="_blank"
						rel="noopener noreferrer"
						className="signup-wrapper__testimonial-url"
					>
						{ testimonial.url.name }
					</a>
				</div>
			</div>
		</div>
	);
};

export default SignupTestimonial;
