import { decodeEntities } from '@wordpress/html-entities';
import { Icon, chevronRight, page } from '@wordpress/icons';
import './styles.scss';

type SearchResultItemProps = {
	link: string;
	title: string;
	onLinkClickHandler: () => void;
};

const SupportDocLink = ( { title, onLinkClickHandler }: SearchResultItemProps ) => {
	const anchor = '#';
	return (
		<div className="odie-support-doc-link__container">
			<div className="odie-support-doc-link__link">
				<a href={ anchor } onClick={ onLinkClickHandler }>
					<Icon icon={ page } />
					<span>{ decodeEntities( title ) }</span>
					<Icon width={ 20 } height={ 20 } icon={ chevronRight } />
				</a>
			</div>
		</div>
	);
};

export default SupportDocLink;
