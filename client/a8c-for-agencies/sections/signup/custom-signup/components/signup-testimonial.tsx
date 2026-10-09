/**
 * PROTOTYPE — proof of concept only.
 *
 * Testimonial card for the `/custom-signup` sidebar. Reuses signup-v2's
 * testimonial data with this prototype's own markup and styles.
 */
import { getTestimonial } from '../../signup-v2/components/signup-wrapper/lib/testimonials';

export default function SignupTestimonial() {
	const testimonial = getTestimonial();

	return (
		<figure className="a4a-custom-signup-testimonial">
			<blockquote className="a4a-custom-signup-testimonial-quote">{ testimonial.quote }</blockquote>
			<figcaption className="a4a-custom-signup-testimonial-author">
				<img className="a4a-custom-signup-testimonial-avatar" alt="" src={ testimonial.avatar } />
				<span className="a4a-custom-signup-testimonial-info">
					<span className="a4a-custom-signup-testimonial-name">{ testimonial.name }</span>
					<span>{ testimonial.position }</span>
					<span>{ testimonial.company.name }</span>
				</span>
			</figcaption>
		</figure>
	);
}
