import fbIcons from './fb-icons.png';

import './styles.scss';

const FacebookPostIcon: React.FC< { name: string } > = ( { name } ) => (
	<i
		className={ `facebook-preview__post-icon facebook-preview__post-icon-${ name }` }
		style={ { backgroundImage: `url(${ fbIcons })` } }
	/>
);

export default FacebookPostIcon;
