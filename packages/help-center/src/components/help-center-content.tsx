/* eslint-disable no-restricted-imports */
/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { CardBody } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';
import classnames from 'classnames';
import { useSelector } from 'react-redux';
import { Route, useLocation } from 'react-router-dom';
import { getSectionName } from 'calypso/state/ui/selectors';
/**
 * Internal Dependencies
 */
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterEmbedResult } from './help-center-embed-result';
import InlineChat from './help-center-inline-chat';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';

const HelpCenterContent: React.FC = () => {
	const location = useLocation();
	const className = classnames( 'help-center__container-content' );
	const containerRef = useRef< HTMLDivElement >( null );
	const section = useSelector( getSectionName );

	useEffect( () => {
		recordTracksEvent( 'calypso_helpcenter_page_open', {
			pathname: location.pathname,
			search: location.search,
			section,
			location: 'help-center',
		} );
	}, [ location, section ] );

	// reset the scroll location on navigation
	useEffect( () => {
		if ( containerRef.current ) {
			containerRef.current.scrollTo( 0, 0 );
		}
	}, [ location ] );

	return (
		<CardBody ref={ containerRef } className={ className }>
			<Route exact path="/">
				<HelpCenterSearch />
			</Route>
			<Route path="/post">
				<HelpCenterEmbedResult />
			</Route>
			<Route path="/contact-options">
				<HelpCenterContactPage />
			</Route>
			<Route path="/contact-form">
				<HelpCenterContactForm />
			</Route>
			<Route path="/success">
				<SuccessScreen />
			</Route>
			<Route path="/inline-chat">
				<InlineChat />
			</Route>
		</CardBody>
	);
};

export default HelpCenterContent;
