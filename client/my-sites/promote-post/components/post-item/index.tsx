import { CompactCard } from '@automattic/components';
import './style.scss';
import { Button } from '@wordpress/components';

export type Post = {
	ID: number;
	global_ID: string;
	featured_image: string;
	title: string;
	date: string;
	modified: string;
	excerpt: string;
	content: string;
	site_ID: number;
	slug: string;
	status: string;
	type: string; // post, page
};

type Props = {
	post: Post;
};

export default function PostItem( { post }: Props ) {
	return (
		<CompactCard className="post-item__card">
			<div className="post-item__main">
				<div className="post-item__image-container">
					<img className="post-item__image" src={ post.featured_image } alt="" />
				</div>
				<div>
					<div className="post-item__title">{ post.title }</div>
					<div className="post-item__subtitle">{ post.date }</div>
				</div>
			</div>
			<Button isLink>Promote</Button>
		</CompactCard>
	);
}
