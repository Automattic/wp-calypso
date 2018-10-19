/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/*
 * Style dependencies
 */
import './style.scss';

const Testimonial = ( { translate } ) => {
	return (
		<div className="testimonial">
			<div className="testimonial__image">
				<img src="/calypso/images/signup/debperlman.jpg" alt="" />
			</div>
			<div className="testimonial__content">
				{ translate(
					'“I love having a place where I can share what I’m working on in an immediate way and have a conversation with people who are equally excited about it.”'
				) }
			</div>
			<div className="testimonial__author">
				{ translate(
					'{{spanName}}Deb Perlman{{/spanName}}, {{spanSite}}smittenkitchen.com{{/spanSite}}',
					{
						components: {
							spanName: <span className="testimonial__name" />,
							spanSite: <span className="testimonial__site" />,
						},
						comment: 'Customer name with comma, followed by domain name',
					}
				) }
			</div>
		</div>
	);
};

export default localize( Testimonial );
