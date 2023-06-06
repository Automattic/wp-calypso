import { Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { GrowAudienceIcon, ImportSubscribersIcon, TurnIntoSubscribersIcon } from './icons';
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
		<Gridicon icon="chevron-right" size={ 18 } />
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
				icon={ <TurnIntoSubscribersIcon /> }
				text={ translate( 'Turn your visitors into subscribers' ) }
			/>
			<EmptyListCTALink
				href="https://wordpress.com/support/launch-a-newsletter/import-subscribers-to-a-newsletter/"
				icon={ <ImportSubscribersIcon /> }
				text={ translate( 'Import existing subscribers' ) }
			/>
			<EmptyListCTALink
				href="https://wordpress.com/support/category/grow-your-audience/"
				icon={ <GrowAudienceIcon /> }
				text={ translate( 'Grow your audience' ) }
			/>
		</div>
	);
};

export default EmptyListView;
