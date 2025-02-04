import './styles.scss';

const FacebookPostIcon: React.FC< { name: string } > = ( { name } ) => (
	<i className={ `facebook-preview__post-icon facebook-preview__post-icon-${ name }` } />
);

export default FacebookPostIcon;
