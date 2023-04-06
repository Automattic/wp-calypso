import { useTranslate } from 'i18n-calypso';
import './styles.scss';

const CommentList = () => {
	const translate = useTranslate();

	return (
		<ul className="subscription-manager__comment-list" role="table">
			<li className="row header" role="row">
				<span className="site" role="columnheader">
					{ translate( 'Subscribed post' ) }
				</span>
				<span className="title-box" role="columnheader">
					{ translate( 'Site' ) }
				</span>
				<span className="date" role="columnheader">
					{ translate( 'Since' ) }
				</span>
				<span className="actions" role="columnheader" />
			</li>
		</ul>
	);
};

export default CommentList;
