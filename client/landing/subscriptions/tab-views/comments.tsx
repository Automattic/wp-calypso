import CommentList from '../comment-list/comment-list';
import TabView from './tab-view';

const Comments = () => (
	<TabView errorMessage="" isLoading={ false }>
		<CommentList />
	</TabView>
);

export default Comments;
