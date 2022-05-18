import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useSupportAvailability } from '@automattic/data-stores';
import { useHappychatAuth } from '@automattic/happychat-connection';
import { HelpCenterContext, execute as DirectlyRTM } from '@automattic/help-center';
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useState, useEffect, useRef, useContext } from '@wordpress/element';
import { Icon, page as pageIcon } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { VIEW_CONTACT, VIEW_RICH_RESULT } from './constants';
import InlineHelpContactPage, { InlineHelpContactPageButton } from './inline-help-contact-page';
import InlineHelpEmbedResult from './inline-help-embed-result';
import InlineHelpMoreResources from './inline-help-more-resources';
import InlineHelpSearchCard from './inline-help-search-card';
import InlineHelpSearchResults from './inline-help-search-results';

import './inline-help-center-content.scss';

const InlineHelpCenterContent = ( { setContactFormOpen, openInContactPage } ) => {
	const isMobile = useMobileBreakpoint();
	const { __ } = useI18n();
	const [ directly, updateDirectly ] = useState( { isLoaded: false, hasSession: false } );
	const [ searchQuery, setSearchQuery ] = useState( '' );
	const [ activeSecondaryView, setActiveSecondaryView ] = useState(
		openInContactPage ? VIEW_CONTACT : null
	);
	const { setHeaderText, setFooterContent, selectedArticle, setSelectedArticle } =
		useContext( HelpCenterContext );
	const secondaryViewRef = useRef();

	// prefetch the values
	useSupportAvailability( 'CHAT' );
	useSupportAvailability( 'EMAIL' );
	useHappychatAuth();

	// Load Directly if needed
	useEffect( () => {
		// Not sure how we want to determine this
		const hasDirectlySupport = true;

		if ( hasDirectlySupport ) {
			DirectlyRTM( [
				'onReady',
				( { session } ) => updateDirectly( { isLoaded: true, hasSession: session } ),
			] );
		}
	}, [] );

	const openSecondaryView = ( secondaryViewKey ) => {
		recordTracksEvent( `calypso_inlinehelp_${ secondaryViewKey }_show`, {
			location: 'inline-help-popover',
		} );
		setActiveSecondaryView( secondaryViewKey );
	};

	// Focus the secondary popover contents after the state is set
	useEffect( () => {
		const contentTitle = secondaryViewRef.current.querySelector( 'h2' );

		if ( contentTitle ) {
			contentTitle.focus();
		}

		if ( activeSecondaryView === VIEW_CONTACT ) {
			setHeaderText( __( 'Contact our WordPress.com experts' ) );
		} else if ( activeSecondaryView === VIEW_RICH_RESULT ) {
			setHeaderText(
				<div className="inline-help__rich-result-header">
					<Icon size="20" icon={ pageIcon } />
					{ selectedArticle?.title }
				</div>
			);
		} else {
			setHeaderText( null );
		}
	}, [ activeSecondaryView, selectedArticle, setHeaderText, __ ] );

	const openResultView = ( event, result ) => {
		event.preventDefault();
		setSelectedArticle( result );
		openSecondaryView( VIEW_RICH_RESULT );
	};

	const closeSecondaryView = () => {
		recordTracksEvent( `calypso_inlinehelp_${ activeSecondaryView }_hide`, {
			location: 'inline-help-popover',
		} );
		setActiveSecondaryView( null );
		setSelectedArticle( null );
	};

	const openContactView = () => {
		if ( directly.isLoaded && directly.hasSession ) {
			DirectlyRTM( [ 'maximize' ] );
			// Need to close HelpCenter as well
		}

		openSecondaryView( VIEW_CONTACT );
	};

	const setAdminSection = () => {
		if ( ! isMobile ) {
			return;
		}
	};

	const renderSecondaryView = () => {
		const classes = classNames(
			'inline-help__secondary-view',
			`inline-help__${ activeSecondaryView }`
		);

		return (
			<section ref={ secondaryViewRef } className={ classes }>
				{
					{
						[ VIEW_CONTACT ]: (
							<InlineHelpContactPage
								closeContactPage={ closeSecondaryView }
								onSelectResource={ openResultView }
								setContactFormOpen={ setContactFormOpen }
							/>
						),
						[ VIEW_RICH_RESULT ]: (
							<InlineHelpEmbedResult
								result={ selectedArticle }
								handleBackButton={ closeSecondaryView }
								searchQuery={ searchQuery }
							/>
						),
					}[ activeSecondaryView ]
				}
			</section>
		);
	};

	const renderHelpCenterContent = () => {
		return (
			<>
				<div className="inline-help__search">
					<InlineHelpSearchCard
						searchQuery={ searchQuery }
						onSearch={ setSearchQuery }
						isVisible={ ! activeSecondaryView }
					/>
					<InlineHelpSearchResults
						onSelect={ openResultView }
						onAdminSectionSelect={ setAdminSection }
						searchQuery={ searchQuery }
						openAdminInNewTab={ true }
					/>
					{ ! searchQuery && <InlineHelpMoreResources /> }
				</div>
				{ renderSecondaryView() }
			</>
		);
	};

	useEffect( () => {
		setFooterContent(
			activeSecondaryView ? null : (
				<InlineHelpContactPageButton
					onClick={ openContactView }
					onSelectResource={ openResultView }
				/>
			)
		);
	}, [ activeSecondaryView ] );

	useEffect( () => {
		if ( selectedArticle ) {
			openSecondaryView( VIEW_RICH_RESULT );
		}
	}, [] );

	const className = classNames(
		'inline-help-center__content',
		activeSecondaryView && `is-secondary-view-${ activeSecondaryView }`,
		{
			'is-secondary-view-active': activeSecondaryView,
		}
	);

	return <div className={ className }>{ renderHelpCenterContent() }</div>;
};

export default InlineHelpCenterContent;
