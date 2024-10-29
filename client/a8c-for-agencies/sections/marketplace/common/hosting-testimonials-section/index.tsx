import React from 'react';
import PageSection, { PageSectionProps } from 'calypso/a8c-for-agencies/components/page-section';

import './style.scss';

type Props = Omit< PageSectionProps, 'children' > & {
	items: {
		profile: {
			avatar?: string;
			name: string;
			title: React.ReactNode;
			site?: string;
			siteLink?: string;
		};
		testimonial: string;
	}[];
	itemBackgroundColor?: string;
};

export default function HostingTestimonialsSection( {
	icon,
	heading,
	subheading,
	background,
	description,
	items,
	itemBackgroundColor,
}: Props ) {
	return (
		<PageSection
			icon={ icon }
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<div className="hosting-testimonials">
				{ items.map( ( item, index ) => (
					<div
						style={ {
							backgroundColor: itemBackgroundColor,
						} }
						className="hosting-testimonials__item"
						key={ `testimonial-item-${ index }` }
					>
						<p className="hosting-testimonials__item-message">{ item.testimonial }</p>

						<div className="hosting-testimonials__item-profile">
							{ item.profile.avatar && (
								<img
									className="hosting-testimonials__item-profile-avatar"
									alt="avatar"
									src={ item.profile.avatar }
								/>
							) }

							<div className="hosting-testimonials__item-profile-details">
								<b className="hosting-testimonials__item-profile-name">{ item.profile.name }</b>

								<div className="hosting-testimonials__item-profile-title">
									{ item.profile.title }
								</div>

								{ item.profile.site && (
									<span className="hosting-testimonials__item-profile-link">
										<a
											href={
												item.profile.siteLink
													? item.profile.siteLink
													: `https://${ item.profile.site }`
											}
											target="_blank"
											rel="noreferrer"
										>
											{ item.profile.site }
										</a>
										&nbsp;↗
									</span>
								) }
							</div>
						</div>
					</div>
				) ) }
			</div>
		</PageSection>
	);
}
