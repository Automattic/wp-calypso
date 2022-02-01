import { Title, SubTitle } from '@automattic/onboarding';
import classnames from 'classnames';
import { translate } from 'i18n-calypso';
import React from 'react';

const NotFound: React.FunctionComponent = () => {
	return (
		<div className={ classnames( 'import-layout__text-center' ) }>
			<Title>{ translate( 'Uh oh. Page not found.' ) }</Title>
			<SubTitle>
				{ translate( "Sorry, the page you were looking for doesn't exist or has been moved." ) }
			</SubTitle>
			<img alt="Not Found" src="/calypso/images/illustrations/illustration-404.svg" />
		</div>
	);
};

export default NotFound;
