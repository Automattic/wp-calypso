/**
 * External dependencies
 */
import React from 'react';
//import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
// import Button from 'components/button';
import Card from 'components/card';
import MainWrapper from '../main-wrapper';
import Login from 'blocks/login';

const JetpackLogin = () => {
	return (
		<MainWrapper>
			<div className="jetpack-connect__login">
				<Card className="jetpack-connect__login-container">
					<Login></Login>
				</Card>
			</div>
		</MainWrapper>
	);
};

export default JetpackLogin;
