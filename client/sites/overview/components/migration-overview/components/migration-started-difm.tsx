import { globe, group, Icon, scheduled, envelope } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { Container, Header } from './layout';

export const MigrationStartedDIFM = () => {
	const translate = useTranslate();

	const title = translate( "We've received your migration request" );
	const subTitle = translate(
		"Our team has received your details. We will review your site to make sure we have everything we need. Here's what you can expect next:"
	) as string;

	return (
		<Container>
			<Header title={ title } subTitle={ subTitle } />
			<div className="migration-started-difm">
				<h2 className="migration-started-difm__title">{ translate( 'What to expect' ) }</h2>
				<ul className="migration-started-difm__list">
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ envelope } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"We'll send you an email with more details on the process and we'll let you know when we start the migration."
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ group } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"We'll bring over a copy of your site, without affecting the current live version."
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ scheduled } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"You'll get an update on the progress of your migration within 2-3 business days."
							) }
						</span>
					</li>
					<li className="migration-started-difm__item">
						<div className="migration-started-difm__icon-wrapper">
							<Icon icon={ globe } className="migration-started-difm__icon" size={ 30 } />
						</div>
						<span>
							{ translate(
								"We'll help you switch your domain over after the migration's completed."
							) }
						</span>
					</li>
				</ul>
			</div>
		</Container>
	);
};
