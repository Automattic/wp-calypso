import { CardBody } from '@wordpress/components';
import classnames from 'classnames';
import { Route } from 'react-router-dom';
import { Content } from '../types';
import { HelpCenterContactForm } from './help-center-contact-form';
import { HelpCenterContactPage } from './help-center-contact-page';
import { HelpCenterEmbedResult } from './help-center-embed-result';
import InlineChat from './help-center-inline-chat';
import { HelpCenterSearch } from './help-center-search';
import { SuccessScreen } from './ticket-success-screen';

const HelpCenterContent: React.FC< Content > = ( { isMinimized } ) => {
	const className = classnames( 'help-center__container-content' );
	return (
		<CardBody hidden={ isMinimized } className={ className }>
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
