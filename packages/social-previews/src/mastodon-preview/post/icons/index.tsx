import './styles.scss';

const MastodonPostIcon: React.FC< { name: string } > = ( { name } ) => (
	<i className={ `mastodon-preview__post-icon mastodon-preview__post-icon-${ name }` } />
);

export default MastodonPostIcon;
