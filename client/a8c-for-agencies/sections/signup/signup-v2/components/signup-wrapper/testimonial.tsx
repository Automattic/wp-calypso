import { getTestimonial } from './lib/testimonials';

const SignupTestimonial = () => {
	const testimonial = getTestimonial();
	return (
		<div className="signup-wrapper__testimonial-wrapper">
			<div className="signup-wrapper__testimonial">
				<p className="signup-wrapper__testimonial-text">{ testimonial.quote }</p>

				<div className="signup-wrapper__testimonial-author">
					<img
						className="signup-wrapper__testimonial-avatar"
						alt="avatar"
						src={ testimonial.avatar }
					/>
					<div className="signup-wrapper__testimonial-info">
						<span className="signup-wrapper__testimonial-name">{ testimonial.name }</span>
						<span className="signup-wrapper__testimonial-title">{ testimonial.position }</span>
						<span>{ testimonial.company.name }</span>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupTestimonial;
