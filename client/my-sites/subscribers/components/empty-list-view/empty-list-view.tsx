import { Icon } from '@wordpress/components';
import { chartBar, chevronRight, people, trendingUp } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import './styles.scss';

type EmptyListCTALinkProps = {
	href: string;
	icon: JSX.Element;
	text: string;
};

const EmptyListCTALink = ( { href, icon, text }: EmptyListCTALinkProps ) => (
	<a className="empty-list-view__cta-link" href={ href } target="_blank" rel="noreferrer">
		<span className="empty-list-view__cta-link-icon">{ icon }</span>
		<span className="empty-list-view__cta-link-text">{ text }</span>
		<Icon icon={ chevronRight } size={ 20 } />
	</a>
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
				href="https://wordpress.com/support/wordpress-editor/blocks/subscribe-block/"
				icon={ <Icon icon={ chartBar } size={ 20 } /> }
				text={ translate( 'Turn your visitors into subscribers' ) }
			/>
			<EmptyListCTALink
				href="https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/"
				icon={ <Icon icon={ people } size={ 20 } /> }
				text={ translate( 'Import existing subscribers' ) }
			/>
			<EmptyListCTALink
				href="https://wordpress.com/support/category/grow-your-audience/"
				icon={ <Icon icon={ trendingUp } size={ 20 } /> }
				text={ translate( 'Grow your audience' ) }
			/>
		</div>
	);
};

export default EmptyListView;
