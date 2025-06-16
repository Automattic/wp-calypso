import { useTranslate } from 'i18n-calypso';
import PageSection from 'calypso/a8c-for-agencies/components/page-section';
import SimpleList from 'calypso/a8c-for-agencies/components/simple-list';
import VipAgencyProgramForm from './form';

import './style.scss';

export default function VipAgencyProgramSection() {
	const translate = useTranslate();
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
				</div>
				<div className="vip-agency-program-section__main">
					<VipAgencyProgramForm />
				</div>
			</div>
		</PageSection>
	);
}
