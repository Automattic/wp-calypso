import { localizeUrl } from '@automattic/i18n-utils';
import { Card, CardBody, Icon } from '@wordpress/components';
import { chartBar, chevronRight, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

type EmptyListCTALinkProps = {
	icon: JSX.Element;
	text: string;
	url: string;
};

const EmptyListCTALink = ( { icon, text, url }: EmptyListCTALinkProps ) => (
	<Card
		className="empty-list-view__cta-link"
		size="small"
		as="a"
		href={ url }
		rel="noreferrer"
		target="_blank"
	>
		<CardBody className="empty-list-view__card-body">
			<Icon className="empty-list-view__cta-link-icon" icon={ icon } size={ 20 } />
			<span className="empty-list-view__cta-link-text">{ text }</span>
			<Icon className="empty-list-view__cta-link-icon" icon={ chevronRight } size={ 20 } />
		</CardBody>
	</Card>
);

const EmptyListView = () => {
	const translate = useTranslate();

	return (
		<div className="empty-list-view">
			<h2 className="empty-list-view__title">{ translate( 'Grow your subscribers' ) }</h2>
			<p className="empty-list-view__description">
				{ translate(
					'Publishing & sharing content can help bring traffic to your site. Let’s help you get started.'
				) }
			</p>
			<EmptyListCTALink
				icon={ chartBar }
				text={ translate( 'Turn your visitors into subscribers' ) }
				url={ localizeUrl(
					'https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/'
				) }
			/>
			<EmptyListCTALink
				icon={ people }
				text={ translate( 'Import existing subscribers' ) }
				url={ localizeUrl(
					'https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/'
				) }
			/>
			<EmptyListCTALink
				icon={ trendingUp }
				text={ translate( 'Grow your audience' ) }
				url={ localizeUrl( 'https://wordpress.com/support/category/grow-your-audience/' ) }
			/>
		</div>
	);
};

export default EmptyListView;
