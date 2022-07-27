import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import megaphoneIllustration from 'calypso/assets/images/customer-home/illustration--megaphone.svg';
import EmptyContent from 'calypso/components/empty-content';
import ListEnd from 'calypso/components/list-end';
import SectionHeader from 'calypso/components/section-header';
import PromotedPost from 'calypso/my-sites/promote-post/components/promoted-post';
import './style.scss';

export default function PromotedPostList() {
	const isEmpty = false;
	const posts = [ 1, 2, 3 ];
	return (
		<>
			{ isEmpty && (
				<EmptyContent
					title={ translate( 'No promoted posts' ) }
					line={ 'attributes.line' }
					action={ 'attributes.action' }
					actionURL={ 'attributes.actionURL' }
					// actionHoverCallback={ preloadEditor }
					illustration={ megaphoneIllustration }
					illustrationWidth={ 150 }
				/>
			) }
			{ ! isEmpty && (
				<>
					<SectionHeader label={ translate( 'Promoted Posts' ) }>
						<Button primary compact className="promoted-post-list__promote-new">
							{ translate( 'Promote new post' ) }
						</Button>
					</SectionHeader>
					{ posts.map( function () {
						return <PromotedPost />;
					} ) }
					<ListEnd />
				</>
			) }
		</>
	);
}
