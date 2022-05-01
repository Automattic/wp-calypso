import { Button, Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import InlineHelpSearchResults from './inline-help-search-results';

import './inline-help-contact-page.scss';

interface Props {
	closeContactPage: () => void;
	onSelectResource: () => void;
}

const InlineHelpContactPage: React.FC< Props > = ( { closeContactPage, onSelectResource } ) => {
	const { __ } = useI18n();

	return (
		<div className="inline-help__contact-page">
			<Button borderless={ true } onClick={ closeContactPage }>
				<Gridicon icon={ 'chevron-left' } size={ 18 } />
				{ __( 'Back' ) }
			</Button>
			<div className="inline-help__contact-content">
				<h3>{ __( 'Contact our WordPress.com experts' ) }</h3>
				<div className="inline-help__contact-boxes">
					<button className={ classnames( 'inline-help__contact-box', 'chat' ) }>
						<div className="inline-help__contact-box-icon">
							<Gridicon icon={ 'comment' } />
						</div>
						<div>
							<h2>{ __( 'Live chat' ) }</h2>
							<p>{ __( 'Get an immediate reply' ) }</p>
						</div>
					</button>
					<button className={ classnames( 'inline-help__contact-box', 'email' ) }>
						<div className="inline-help__contact-box-icon">
							<Gridicon icon={ 'mail' } />
						</div>
						<div>
							<h2>{ __( 'Email' ) }</h2>
							<p>{ __( 'An expert will get back to you soon' ) }</p>
						</div>
					</button>
				</div>
			</div>
			<InlineHelpSearchResults onSelect={ onSelectResource } placeholderLines={ 4 } />
		</div>
	);
};

export const InlineHelpContactPageButton: React.FC< { onClick: () => void } > = ( { onClick } ) => {
	const { __ } = useI18n();

	return (
		<Button className="inline-help__contact-button" borderless={ false } onClick={ onClick }>
			<Gridicon icon={ 'comment' } size={ 24 } fill="" />
			<span>{ __( 'Still need help?' ) }</span>
		</Button>
	);
};

export default InlineHelpContactPage;
