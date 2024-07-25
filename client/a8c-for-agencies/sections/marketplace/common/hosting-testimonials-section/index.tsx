import HostingSection, { HostingSectionProps } from '../hosting-section';

import './style.scss';

type Props = Omit< HostingSectionProps, 'children' > & {
	items: {
		profile: {
			avatar?: string;
			name: string;
			title: string;
			site?: string;
			siteLink?: string;
		};
		testimonial: string;
	}[];
};

export default function HostingTestimonialsSection( {
	heading,
	subheading,
	background,
	description,
	items,
}: Props ) {
	return (
		<HostingSection
			heading={ heading }
			subheading={ subheading }
			background={ background }
			description={ description }
		>
			<div className="hosting-testimonials">
				{ items.map( ( item, index ) => (
					<div className="hosting-testimonials__item" key={ `testimonial-item-${ index }` }>
						<p className="hosting-testimonials__item-message">{ item.testimonial }</p>

						<div className="hosting-testimonials__item-profile">
							{ item.profile.avatar && (
								<img
									className="hosting-testimonials__item-profile-avatar"
									alt=""
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
										</a>{ ' ' }
										↗
									</span>
								) }
							</div>
						</div>
					</div>
				) ) }
			</div>
		</HostingSection>
	);
}
