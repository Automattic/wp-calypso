import config from '@automattic/calypso-config';
import './style.scss';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';

type Props = {
	type: 'campaigns' | 'posts';
};

export default function EmptyPromotionList( props: Props ) {
	const { type } = props;

	const isRunningInJetpack = config.isEnabled( 'is_running_in_jetpack_site' );

	const translate = useTranslate();

	let title;
	let subtitle;

	if ( type === 'campaigns' ) {
		title = translate( 'You have no campaigns' );
		subtitle = translate(
			'You have not created any campaigns Click {{learnMoreLink}}Promote{{/learnMoreLink}} to get started.',
			{
				components: {
					learnMoreLink: (
						<InlineSupportLink
							supportContext="advertising"
							showIcon={ false }
							showSupportModal={ ! isRunningInJetpack }
						/>
					),
				},
			}
		);
	} else if ( type === 'posts' ) {
		title = translate( 'You have content to promote' );
		subtitle = translate(
			'You have not published any posts, pages or products yet. Make sure your content is published and come back to promote it.'
		);
	}

	return (
		<div className="empty-promotion-list__container">
			<h3 className="empty-promotion-list__title wp-brand-font">{ title }</h3>
			<p className="empty-promotion-list__body">{ subtitle }</p>
		</div>
	);
}
