import { Button } from '@automattic/components';
import { useSupportAvailability } from '@automattic/data-stores';
import { Icon, comment, chevronLeft } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import React, { useEffect } from 'react';
import Mail from './icons/mail';
import InlineHelpSearchResults from './inline-help-search-results';
interface Props {
	closeContactPage: () => void;
	onSelectResource: () => void;
	setContactFormOpen: ( formMode: string ) => void;
}

const InlineHelpContactPage: React.FC< Props > = ( {
	closeContactPage,
	onSelectResource,
	setContactFormOpen,
} ) => {
	const { __ } = useI18n();

	const { data: dataChat, isLoading: isLoadingChat } = useSupportAvailability( 'CHAT' );
	const { data: dataEmail, isLoading: isLoadingEmail } = useSupportAvailability( 'EMAIL' );

	// If user has both chat and email options, we show him the contact-page to choose
	// If instead the user has one option, we show him the contact form directly
	useEffect( () => {
		if ( ! isLoadingChat && ! isLoadingEmail ) {
			if ( ! dataChat?.isUserEligible ) {
				if ( dataEmail?.is_user_eligible ) {
					setContactFormOpen( 'EMAIL' );
				} else {
					setContactFormOpen( 'FORUM' );
				}
			}
		}
	}, [ isLoadingChat, isLoadingEmail, dataChat, dataEmail, setContactFormOpen ] );

	if ( isLoadingChat || isLoadingEmail ) {
		return null;
	}

	return (
		<div className="inline-help__contact-page">
			<Button borderless={ true } onClick={ closeContactPage } className="inline-help__back-button">
				<Icon icon={ chevronLeft } size={ 18 } />
				{ __( 'Back' ) }
			</Button>
			<div className="inline-help__contact-content">
				<h3>{ __( 'Contact our WordPress.com experts' ) }</h3>
				<div
					className={ classnames( 'inline-help__contact-boxes', {
						'is-reversed': dataChat?.isClosed,
					} ) }
				>
					<div
						className={ classnames( 'inline-help__contact-box', 'chat', {
							'is-disabled': dataChat?.isClosed,
						} ) }
						onClick={ () => setContactFormOpen( 'CHAT' ) }
						onKeyDown={ () => setContactFormOpen( 'CHAT' ) }
						role="button"
						tabIndex={ 0 }
					>
						<div className="inline-help__contact-box-icon">
							<Icon icon={ comment } />
						</div>
						<div>
							<h2>{ __( 'Live chat' ) }</h2>
							<p>
								{ dataChat?.isClosed
									? __( 'Chat is unavailable right now' )
									: __( 'Get an immediate reply' ) }
							</p>
						</div>
					</div>
					<div
						className={ classnames( 'inline-help__contact-box', 'email' ) }
						onClick={ () => setContactFormOpen( 'EMAIL' ) }
						onKeyDown={ () => setContactFormOpen( 'EMAIL' ) }
						role="button"
						tabIndex={ 0 }
					>
						<div className="inline-help__contact-box-icon">
							<Icon icon={ <Mail /> } />
						</div>
						<div>
							<h2>{ __( 'Email' ) }</h2>
							<p>{ __( 'An expert will get back to you soon' ) }</p>
						</div>
					</div>
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
			<Icon icon={ comment } />
			<span>{ __( 'Still need help?' ) }</span>
		</Button>
	);
};

export default InlineHelpContactPage;
