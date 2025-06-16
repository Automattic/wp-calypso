import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import VipAgencyProgramForm from './form';

import './style.scss';

export default function VipAgencyProgramSection() {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onVipAgencyProgramLinkClick = () => {
		dispatch(
			recordTracksEvent(
				'calypso_a4a_marketplace_hosting_enterprise_vip_agency_program_link_click'
			)
		);
	};

	return (
		<PageSection
			className="vip-agency-program-section"
			heading={ translate( 'Help us build the future of the web' ) }
			description={ translate( 'Become a WordPress VIP Agency Partner.' ) }
		>
			<div className="vip-agency-program-section__content">
				<div className="vip-agency-program-section__aside">
					<h3 className="vip-agency-program-section__aside-heading">
						{ translate( 'Explore the benefits of partnership' ) }
					</h3>

					<div className="vip-agency-program-section__aside-section">
						<h4 className="vip-agency-program-section__aside-section-heading">
							{ translate( 'Exclusive access' ) }
						</h4>

						<SimpleList
							items={ [
								translate(
									'{{b}}Access to new features and capabilities{{/b}} to help keep your team ahead of the curve.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}Access to a dedicated team{{/b}} to help guide and support you every step of the way.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}Access to training and education{{/b}} to help your team stay sharp and competitive in the market.',
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>
					</div>

					<div className="vip-agency-program-section__aside-section">
						<h4 className="vip-agency-program-section__aside-section-heading">
							{ translate( 'Brand building' ) }
						</h4>

						<SimpleList
							items={ [
								translate(
									"{{b}}Co-marketing and events{{/b}} to help boost your agency's brand and generate new business.",
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>
					</div>

					<div className="vip-agency-program-section__aside-section">
						<h4 className="vip-agency-program-section__aside-section-heading">
							{ translate( 'Business growth' ) }
						</h4>

						<SimpleList
							items={ [
								translate(
									'{{b}}Two-way business referrals{{/b}}. Earn commissions on new business we bring to your agency, and on new business you bring to VIP.',
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>
					</div>

					<div className="vip-agency-program-section__aside-card">
						<h4 className="vip-agency-program-section__aside-card-heading">
							{ translate( 'Ready to take the next step?' ) }
						</h4>

						<p className="vip-agency-program-section__aside-card-description">
							{ translate(
								'Complete our interest form for consideration or visit the {{link}}WordPress VIP Agency Partner Program{{/link}} to learn more.',
								{
									components: {
										link: (
											<a
												href="https://wpvip.com/why-become-a-wordpress-vip-partner-agency"
												target="_blank"
												rel="noopener noreferrer"
												onClick={ onVipAgencyProgramLinkClick }
											/>
										),
									},
								}
							) }
						</p>
					</div>
				</div>
				<div className="vip-agency-program-section__main">
					<VipAgencyProgramForm />
				</div>
			</div>
		</PageSection>
	);
}
