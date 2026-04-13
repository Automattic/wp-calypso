import './list-tags.scss';

interface ListTagsProps {
	tags: string[] | undefined;
}

export function ListTags( { tags }: ListTagsProps ): JSX.Element | null {
	if ( ! tags || tags.length === 0 ) {
		return null;
	}

	return (
		<div className="list-tags">
			{ tags.map( ( tag ) => (
				<span key={ tag } className="list-tags__tag">
					#{ tag }
				</span>
			) ) }
		</div>
	);
}
