/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

export class PlanTestimonials extends Component {
	render() {
		return (
			<div className="plan-testimonials__container">
				<div className="plan-testimonials__content-left">You're in good hands</div>
				<div className="plan-testimonials__content-right-container">
					<div className="plan-testimonials__content-right">
						Did you know that WordPress powers 35% of the entire internet? WordPress.com is the best
						WordPress solution out there, as trusted by:
					</div>
					<div className="plan-testimonials__content-testimonial-image"></div>
				</div>
			</div>
		);
	}
}

export default localize( PlanTestimonials );
