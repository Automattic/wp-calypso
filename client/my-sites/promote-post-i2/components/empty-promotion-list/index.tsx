import './style.scss';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import { useSelector } from 'calypso/state';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type Props = {
	type: 'campaigns' | 'posts' | 'payments';
};

export default function EmptyPromotionList( props: Props ) {
	const { type } = props;
	const siteId = useSelector( getSelectedSiteId );
	const isSelfHosted = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

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
							showSupportModal={ ! isSelfHosted }
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
	} else if ( type === 'payments' ) {
		title = translate( 'We couldn’t find any payments.' );
		subtitle = translate( 'You haven’t made any payments yet. Once you do, they’ll show up here.' );
	}

	return (
		<div className="empty-promotion-list__container">
			<h3 className="empty-promotion-list__title wp-brand-font">{ title }</h3>
			<p className="empty-promotion-list__body">{ subtitle }</p>
		</div>
	);
}
