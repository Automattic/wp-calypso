import { VisuallyHidden } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';
import { __ } from '@wordpress/i18n';
import { Icon, chevronRight, external, page } from '@wordpress/icons';
import './styles.scss';

type SearchResultItemProps = {
	link: string;
	title: string;
	onLinkClickHandler: () => void;
	openInNewTab?: boolean;
};

const SupportDocLink = ( {
	link,
	title,
	onLinkClickHandler,
	openInNewTab = false,
}: SearchResultItemProps ) => {
	return (
		<div className="odie-support-doc-link__container">
			<div className="odie-support-doc-link__link">
				<a
					href={ openInNewTab ? link : '#' }
					target={ openInNewTab ? '_blank' : undefined }
					rel={ openInNewTab ? 'noopener noreferrer' : undefined }
					onClick={ onLinkClickHandler }
				>
					<Icon icon={ page } />
					<span>{ decodeEntities( title ) }</span>
					{ openInNewTab && (
						<VisuallyHidden as="span">
							{
								/* translators: accessibility text */
								__( '(opens in a new tab)', __i18n_text_domain__ )
							}
						</VisuallyHidden>
					) }
					<Icon width={ 20 } height={ 20 } icon={ openInNewTab ? external : chevronRight } />
				</a>
			</div>
		</div>
	);
};

export default SupportDocLink;
