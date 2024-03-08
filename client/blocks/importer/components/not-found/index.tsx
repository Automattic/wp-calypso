import { Title, SubTitle } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import React from 'react';

const NotFound: React.FunctionComponent = () => {
	return (
		<div className="import__heading import__heading-center">
			<Title>{ translate( 'Uh oh. Page not found.' ) }</Title>
			<SubTitle>
				{ translate( "Sorry, the page you were looking for doesn't exist or has been moved." ) }
			</SubTitle>
			<img
				alt="Not Found"
				src="/calypso/images/illustrations/illustration-404.svg"
				aria-hidden="true"
			/>
		</div>
	);
};

export default NotFound;
