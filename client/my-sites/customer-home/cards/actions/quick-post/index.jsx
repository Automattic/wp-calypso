import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export const QuickPost = () => {
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const site = useSelector( getSelectedSite );

	const startNewPost = () => {
		recordTracksEvent( 'calypso_customer_home_quick_post_clicked', {
			context: 'customer-home',
		} );

		window.open( '/post/' + site.slug );
	};

	return (
		<div className="quick-post customer-home__card">
			<div className="quick-post__title">
				{ translate(
					'{{strong}}Hey there!{{/strong}}{{br}}{{/br}} Did you know people that post more get more traffic?',
					{
						args: [ currentUser.first_name ],
						components: {
							strong: <strong />,
							br: <br />,
						},
					}
				) }
			</div>
			<div className="quick-post__action">
				<Button className="quick-post__action-button" primary onClick={ () => startNewPost() }>
					{ translate( 'New post' ) }
				</Button>
			</div>
		</div>
	);
};

export default QuickPost;
